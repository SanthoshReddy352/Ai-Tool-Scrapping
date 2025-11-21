import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isDuplicate, normalizeUrl } from '../utils/deduplication.ts';
import { categorizeToolAuto, extractTags, cleanDescription } from '../utils/categorization.ts';
import { retryWithBackoff } from '../utils/retry.ts';

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
        // Check if it's AI-related
        if (!isAIRelated(post)) {
          continue;
        }

        // Check for duplicates
        const duplicate = await isDuplicate(supabase, {
          name: post.name,
          url: normalizeUrl(post.url),
          description: post.description
        });

        if (duplicate) {
          results.duplicates++;
          continue;
        }

        // Categorize and extract tags
        const category = categorizeToolAuto(post.name, post.description);
        const tags = extractTags(post.name, post.description);

        // Add ProductHunt topics as tags
        if (post.topics?.edges) {
          post.topics.edges.forEach(edge => {
            if (edge.node.name && tags.length < 8) {
              tags.push(edge.node.name.toLowerCase());
            }
          });
        }

        // Insert into database
        const { error } = await supabase.from('ai_tools').insert({
          name: post.name,
          description: cleanDescription(post.description || post.tagline),
          url: normalizeUrl(post.url),
          category,
          tags: Array.from(new Set(tags)),
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
    'automation', 'intelligent', 'smart', 'cognitive'
  ];

  return aiKeywords.some(keyword => text.includes(keyword));
}
