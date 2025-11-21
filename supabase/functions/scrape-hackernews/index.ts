import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isDuplicate, normalizeUrl } from '../utils/deduplication.ts';
import { categorizeToolAuto, extractTags, cleanDescription } from '../utils/categorization.ts';

interface HNItem {
  id: number;
  title: string;
  url?: string;
  text?: string; // Some posts have text instead of URL
  score: number;
  time: number;
  by: string;
  type: string;
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting Hacker News scraper...');

    const results = {
      total: 0,
      added: 0,
      duplicates: 0,
      errors: 0,
      errors_detail: [] as string[]
    };

    // 1. Fetch "Show HN" stories (best for new tools)
    // We use the official Firebase API which is free and public
    const response = await fetch('https://hacker-news.firebaseio.com/v0/showstories.json');
    if (!response.ok) throw new Error('Failed to fetch Show HN stories');
    
    const storyIds: number[] = await response.json();
    
    // Limit to top 30 to avoid timeouts and rate limits
    const recentStoryIds = storyIds.slice(0, 30);
    results.total = recentStoryIds.length;

    for (const id of recentStoryIds) {
      try {
        // 2. Fetch details for each story
        const itemResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (!itemResponse.ok) continue;
        
        const item: HNItem = await itemResponse.json();

        // Skip if it's not a tool (no URL) or deleted
        if (!item.url || item.type !== 'story') {
          continue;
        }

        // 3. Clean up the data
        const toolName = cleanHNTitle(item.title);
        const description = item.text || `${item.title} (via Hacker News)`;

        // 4. Check for duplicates
        const duplicate = await isDuplicate(supabase, {
          name: toolName,
          url: normalizeUrl(item.url),
          description: description
        });

        if (duplicate) {
          results.duplicates++;
          continue;
        }

        // 5. Categorize and Tag
        const category = categorizeToolAuto(toolName, description);
        const tags = extractTags(toolName, description);
        tags.push('show hn', 'hacker news');

        // 6. Insert into DB
        const { error } = await supabase.from('ai_tools').insert({
          name: toolName,
          description: cleanDescription(description),
          url: normalizeUrl(item.url),
          category,
          tags: Array.from(new Set(tags)), // Remove duplicate tags
          image_url: null, // HN doesn't provide images
          release_date: new Date(item.time * 1000).toISOString().split('T')[0],
          source: 'Hacker News'
        });

        if (error) {
          results.errors++;
          results.errors_detail.push(`${toolName}: ${error.message}`);
        } else {
          console.log(`Added: ${toolName}`);
          results.added++;
        }

      } catch (err) {
        results.errors++;
        results.errors_detail.push(`Item ${id}: ${err.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('HN scraper error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Helper to strip "Show HN:" prefix
function cleanHNTitle(title: string): string {
  return title
    .replace(/^Show HN:\s*/i, '') // Remove "Show HN:"
    .replace(/\s-\s.*$/, '')      // Remove " - Description" part if present
    .trim();
}