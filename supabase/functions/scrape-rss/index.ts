import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isDuplicate, normalizeUrl } from '../utils/deduplication.ts';
import { parseWithLLM } from '../utils/llm.ts';
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
            // 1. Heuristic Filter: Check if it looks like a tool launch to save LLM tokens
            if (!isToolLaunch(item)) {
              continue;
            }

            // 2. Extract URL: We still need a valid URL to proceed
            const toolUrl = await extractToolUrlFromArticle(item.link);
            if (!toolUrl) {
              continue;
            }

            // 3. LLM Parsing: Use Gemini to get clean data
            const llmResult = await parseWithLLM(item.title, item.description);

            // If LLM says it's not a tool (double-check), skip it
            if (!llmResult.is_tool) {
              continue;
            }

            const name = llmResult.name || item.title; // Fallback to title
            const description = llmResult.description || item.description;
            const category = llmResult.category || 'Other';
            const tags = llmResult.tags || [];

            // 4. Deduplication
            const duplicate = await isDuplicate(supabase, {
              name: name,
              url: normalizeUrl(toolUrl),
              description: description
            });

            if (duplicate) {
              results.duplicates++;
              continue;
            }

            // 5. Insert into DB
            const { error } = await supabase.from('ai_tools').insert({
              name: name,
              description: description,
              url: normalizeUrl(toolUrl),
              category,
              tags: Array.from(new Set(tags)),
              image_url: null,
              release_date: new Date(item.pubDate).toISOString().split('T')[0],
              source: feed.name
            });

            if (error) {
              results.errors++;
              results.errors_detail.push(`${name}: ${error.message}`);
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
  const launchKeywords = ['launch', 'releases', 'introduces', 'unveils', 'announces', 'debuts', 'rolls out', 'new tool', 'new ai', 'startup'];
  const excludeKeywords = ['opinion', 'analysis', 'interview', 'podcast', 'video'];
  return launchKeywords.some(k => text.includes(k)) && !excludeKeywords.some(k => text.includes(k));
}

async function extractToolUrlFromArticle(articleUrl: string): Promise<string | null> {
  try {
    const response = await fetch(articleUrl);
    if (!response.ok) return null;
    const html = await response.text();
    
    // Look for external links that aren't common social/news sites
    const urlRegex = /https?:\/\/(?!(?:techcrunch|theverge|venturebeat|twitter|facebook|linkedin|youtube|google)\.com)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s"'<>]*)?/g;
    const matches = html.match(urlRegex);

    if (matches && matches.length > 0) {
       // Return the first valid external link
       return matches[0]; 
    }
    return null;
  } catch {
    return null;
  }
}