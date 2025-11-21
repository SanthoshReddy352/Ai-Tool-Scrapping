import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isDuplicate, normalizeUrl } from '../utils/deduplication.ts';
import { categorizeToolAuto, extractTags, cleanDescription } from '../utils/categorization.ts';
import { retryWithBackoff } from '../utils/retry.ts';

interface RSSFeed {
  name: string;
  url: string;
}

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = {
      total: 0,
      added: 0,
      duplicates: 0,
      errors: 0,
      errors_detail: [] as string[]
    };

    // RSS feeds to monitor
    const feeds: RSSFeed[] = [
      { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
      { name: 'The Verge AI', url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml' },
      { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/' }
    ];

    for (const feed of feeds) {
      try {
        const items = await retryWithBackoff(() => fetchRSSFeed(feed.url));
        results.total += items.length;

        for (const item of items) {
          try {
            // Check if it's about a tool launch
            if (!isToolLaunch(item)) {
              continue;
            }

            // Extract tool URL from article
            const toolUrl = await extractToolUrlFromArticle(item.link);
            if (!toolUrl) {
              continue;
            }

            // Check for duplicates
            const duplicate = await isDuplicate(supabase, {
              name: extractToolNameFromTitle(item.title),
              url: normalizeUrl(toolUrl),
              description: item.description
            });

            if (duplicate) {
              results.duplicates++;
              continue;
            }

            // Categorize and extract tags
            const category = categorizeToolAuto(item.title, item.description);
            const tags = extractTags(item.title, item.description);

            // Insert into database
            const { error } = await supabase.from('ai_tools').insert({
              name: extractToolNameFromTitle(item.title),
              description: cleanDescription(item.description),
              url: normalizeUrl(toolUrl),
              category,
              tags: Array.from(new Set(tags)),
              image_url: null,
              release_date: new Date(item.pubDate).toISOString().split('T')[0],
              source: feed.name
            });

            if (error) {
              results.errors++;
              results.errors_detail.push(`${item.title}: ${error.message}`);
            } else {
              results.added++;
            }
          } catch (error) {
            results.errors++;
            results.errors_detail.push(`${item.title}: ${error.message}`);
          }
        }
      } catch (error) {
        results.errors++;
        results.errors_detail.push(`Feed ${feed.name}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('RSS scraper error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchRSSFeed(url: string): Promise<RSSItem[]> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`RSS fetch error: ${response.status}`);
  }

  const xml = await response.text();
  return parseRSS(xml);
}

function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  
  // Simple XML parsing (in production, use a proper XML parser)
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const matches = xml.matchAll(itemRegex);

  for (const match of matches) {
    const itemXml = match[1];
    
    const title = extractXMLTag(itemXml, 'title');
    const description = extractXMLTag(itemXml, 'description');
    const link = extractXMLTag(itemXml, 'link');
    const pubDate = extractXMLTag(itemXml, 'pubDate');

    if (title && link) {
      items.push({
        title: cleanHTML(title),
        description: cleanHTML(description || ''),
        link,
        pubDate: pubDate || new Date().toISOString()
      });
    }
  }

  return items;
}

function extractXMLTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function cleanHTML(html: string): string {
  return html
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

function isToolLaunch(item: RSSItem): boolean {
  const text = `${item.title} ${item.description}`.toLowerCase();
  
  const launchKeywords = [
    'launch', 'releases', 'introduces', 'unveils', 'announces',
    'debuts', 'rolls out', 'new tool', 'new ai', 'startup'
  ];

  const excludeKeywords = [
    'opinion', 'analysis', 'interview', 'podcast', 'video'
  ];

  const hasLaunch = launchKeywords.some(keyword => text.includes(keyword));
  const hasExclude = excludeKeywords.some(keyword => text.includes(keyword));

  return hasLaunch && !hasExclude;
}

async function extractToolUrlFromArticle(articleUrl: string): Promise<string | null> {
  try {
    const response = await fetch(articleUrl);
    if (!response.ok) return null;

    const html = await response.text();
    
    // Look for common patterns of tool URLs in articles
    const urlRegex = /https?:\/\/(?!(?:techcrunch|theverge|venturebeat|twitter|facebook|linkedin)\.com)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s"'<>]*)?/g;
    const matches = html.match(urlRegex);

    if (matches && matches.length > 0) {
      // Return the first external URL that's not a social media link
      for (const url of matches) {
        if (!url.includes('twitter.com') && 
            !url.includes('facebook.com') && 
            !url.includes('linkedin.com') &&
            !url.includes('youtube.com')) {
          return url;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

function extractToolNameFromTitle(title: string): string {
  // Remove common news article patterns
  let name = title
    .replace(/^.*?(launches|releases|introduces|unveils|announces)\s+/gi, '')
    .replace(/,.*$/g, '')
    .trim();

  // Take first part if there's a dash
  const parts = name.split(/[-–—]/);
  if (parts.length > 0) {
    name = parts[0].trim();
  }

  return name;
}
