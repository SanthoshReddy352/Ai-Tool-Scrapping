import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isDuplicate, normalizeUrl } from '../utils/deduplication.ts';
import { retryWithBackoff } from '../utils/retry.ts';
import { parseWithLLM } from '../utils/llm.ts';

interface RedditPost {
  data: {
    title: string;
    selftext: string;
    url: string;
    created_utc: number;
    subreddit: string;
    link_flair_text?: string;
  };
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const redditClientId = Deno.env.get('REDDIT_CLIENT_ID');
    const redditClientSecret = Deno.env.get('REDDIT_CLIENT_SECRET');

    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = {
      total: 0,
      added: 0,
      duplicates: 0,
      errors: 0,
      errors_detail: [] as string[]
    };

    // Subreddits to monitor
    const subreddits = ['artificial', 'MachineLearning', 'ArtificialIntelligence', 'OpenAI', 'LocalLLaMA'];

    for (const subreddit of subreddits) {
      try {
        let posts: RedditPost[] = [];

        // If credentials are available, use OAuth
        if (redditClientId && redditClientSecret) {
          const accessToken = await getRedditAccessToken(redditClientId, redditClientSecret);
          posts = await retryWithBackoff(() => fetchRedditPosts(subreddit, accessToken));
        } else {
          // Fallback to public JSON endpoint (no auth required, but rate limited)
          posts = await retryWithBackoff(() => fetchRedditPostsPublic(subreddit));
        }

        results.total += posts.length;

        for (const post of posts) {
          try {
            // Extract URL from post
            const toolUrl = extractToolUrl(post.data);
            if (!toolUrl) {
              continue;
            }

            // Heuristic check first
            if (!isToolAnnouncement(post.data)) {
              continue;
            }

            // Deduplication check
            const duplicate = await isDuplicate(supabase, {
              name: post.data.title,
              url: normalizeUrl(toolUrl),
              description: post.data.selftext
            });

            if (duplicate) {
              results.duplicates++;
              continue;
            }

            // LLM Parsing
            const llmResult = await parseWithLLM(
                post.data.title, 
                post.data.selftext || post.data.title
            );

            if (!llmResult.is_tool) {
                continue;
            }

            const tags = new Set(llmResult.tags || []);
            tags.add(post.data.subreddit.toLowerCase());

            // Insert into database
            const { error } = await supabase.from('ai_tools').insert({
              name: llmResult.name || post.data.title,
              description: llmResult.description || post.data.selftext,
              url: normalizeUrl(toolUrl),
              category: llmResult.category || 'Other',
              tags: Array.from(tags),
              image_url: null,
              release_date: new Date(post.data.created_utc * 1000).toISOString().split('T')[0],
              source: `Reddit r/${post.data.subreddit}`
            });

            if (error) {
              results.errors++;
              results.errors_detail.push(`${post.data.title}: ${error.message}`);
            } else {
              results.added++;
            }
          } catch (error) {
            results.errors++;
            results.errors_detail.push(`${post.data.title}: ${error.message}`);
          }
        }
      } catch (error) {
        results.errors++;
        results.errors_detail.push(`Subreddit ${subreddit}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Reddit scraper error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function getRedditAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const auth = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error(`Reddit OAuth error: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchRedditPosts(subreddit: string, accessToken: string): Promise<RedditPost[]> {
  const response = await fetch(
    `https://oauth.reddit.com/r/${subreddit}/new?limit=25`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'AIToolsDiscovery/1.0'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Reddit API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.children;
}

async function fetchRedditPostsPublic(subreddit: string): Promise<RedditPost[]> {
  const response = await fetch(
    `https://www.reddit.com/r/${subreddit}/new.json?limit=25`,
    {
      headers: {
        'User-Agent': 'AIToolsDiscovery/1.0'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Reddit API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.children;
}

function extractToolUrl(post: any): string | null {
  if (post.url && !post.url.includes('reddit.com')) {
    return post.url;
  }
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = post.selftext?.match(urlRegex);
  if (matches && matches.length > 0) {
    for (const url of matches) {
      if (!url.includes('reddit.com')) {
        return url;
      }
    }
  }
  return null;
}

function isToolAnnouncement(post: any): boolean {
  const title = post.title.toLowerCase();
  const text = post.selftext?.toLowerCase() || '';
  
  const announcementKeywords = [
    'launch', 'released', 'introducing', 'new tool', 'built',
    'created', 'made', 'check out', 'announcement', 'available'
  ];
  const excludeKeywords = ['question', 'help', 'discussion', 'opinion', 'what do you think'];

  const hasAnnouncement = announcementKeywords.some(keyword => 
    title.includes(keyword) || text.includes(keyword)
  );
  const hasExclude = excludeKeywords.some(keyword => 
    title.includes(keyword)
  );

  return hasAnnouncement && !hasExclude;
}