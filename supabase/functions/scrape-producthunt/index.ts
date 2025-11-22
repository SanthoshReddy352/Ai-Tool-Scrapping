import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isDuplicate, normalizeUrl } from '../utils/deduplication.ts';
import { retryWithBackoff } from '../utils/retry.ts';
import { parseWithLLM } from '../utils/llm.ts';

interface ProductHuntPost {
  id: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  thumbnail?: {
    url: string;
  };
  createdAt: string;
  topics?: {
    edges: Array<{
      node: {
        name: string;
      };
    }>;
  };
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const producthuntToken = Deno.env.get('PRODUCTHUNT_API_TOKEN');

    if (!producthuntToken) {
      throw new Error('ProductHunt API token not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch recent posts from ProductHunt
    const posts = await retryWithBackoff(() => fetchProductHuntPosts(producthuntToken));

    const results = {
      total: posts.length,
      added: 0,
      duplicates: 0,
      errors: 0,
      errors_detail: [] as string[]
    };

    for (const post of posts) {
      try {
        // 1. Initial Heuristic Check (to save tokens if obviously not AI)
        if (!isAIRelated(post)) {
          continue;
        }

        // 2. Deduplication Check
        // We use the raw name/url first to avoid LLM cost on duplicates
        const duplicate = await isDuplicate(supabase, {
          name: post.name,
          url: normalizeUrl(post.url),
          description: post.description || post.tagline
        });

        if (duplicate) {
          results.duplicates++;
          continue;
        }

        // 3. LLM Parsing
        const llmResult = await parseWithLLM(
          post.name, 
          `${post.tagline}\n\n${post.description}`
        );
        
        if (!llmResult.is_tool) {
          continue;
        }

        const tags = new Set(llmResult.tags || []);
        
        // Add ProductHunt topics as extra tags
        if (post.topics?.edges) {
          post.topics.edges.forEach(edge => {
            if (edge.node.name) tags.add(edge.node.name.toLowerCase());
          });
        }

        // 4. Insert into database
        const { error } = await supabase.from('ai_tools').insert({
          name: llmResult.name || post.name,
          description: llmResult.description || post.tagline,
          url: normalizeUrl(post.url),
          category: llmResult.category || 'Other',
          tags: Array.from(tags).slice(0, 8), // Limit tags
          image_url: post.thumbnail?.url || null,
          release_date: new Date(post.createdAt).toISOString().split('T')[0],
          source: 'ProductHunt'
        });

        if (error) {
          results.errors++;
          results.errors_detail.push(`${post.name}: ${error.message}`);
        } else {
          results.added++;
        }
      } catch (error) {
        results.errors++;
        results.errors_detail.push(`${post.name}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('ProductHunt scraper error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchProductHuntPosts(token: string): Promise<ProductHuntPost[]> {
  const query = `
    query {
      posts(first: 20, order: NEWEST) {
        edges {
          node {
            id
            name
            tagline
            description
            url
            thumbnail {
              url
            }
            createdAt
            topics(first: 5) {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error(`ProductHunt API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.posts.edges.map((edge: any) => edge.node);
}

function isAIRelated(post: ProductHuntPost): boolean {
  const text = `${post.name} ${post.tagline} ${post.description}`.toLowerCase();
  
  const aiKeywords = [
    'ai', 'artificial intelligence', 'machine learning', 'ml',
    'deep learning', 'neural', 'gpt', 'llm', 'chatbot',
    'automation', 'intelligent', 'smart', 'cognitive', 'copilot', 'agent'
  ];

  return aiKeywords.some(keyword => text.includes(keyword));
}