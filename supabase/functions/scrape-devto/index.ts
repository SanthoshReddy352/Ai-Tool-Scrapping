import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isDuplicate, normalizeUrl } from '../utils/deduplication.ts';
import { retryWithBackoff } from '../utils/retry.ts';
import { parseWithLLM } from '../utils/llm.ts';

interface DevToArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  published_timestamp: string;
  tag_list: string[];
  social_image: string;
  public_reactions_count: number;
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch fresh AI articles from Dev.to
    // state=fresh returns the newest articles
    const articles = await retryWithBackoff(() => fetchDevToArticles());

    const results = {
      total: articles.length,
      added: 0,
      duplicates: 0,
      errors: 0,
      errors_detail: [] as string[]
    };

    for (const article of articles) {
      try {
        // 1. Filter: Must be recent (last 48 hours)
        if (!isRecent(article.published_timestamp)) continue;

        // 2. Heuristic: Check if it's likely a tool launch/showcase
        if (!isLikelyTool(article)) continue;

        // 3. Deduplication
        if (await isDuplicate(supabase, { 
          name: article.title, 
          url: normalizeUrl(article.url), 
          description: article.description 
        })) {
          results.duplicates++;
          continue;
        }

        // 4. LLM Parsing
        const llmResult = await parseWithLLM(
          article.title,
          `${article.description} \n\n Tags: ${article.tag_list.join(', ')}`
        );

        if (!llmResult.is_tool) continue;

        // 5. Insert
        const { error } = await supabase.from('ai_tools').insert({
          name: llmResult.name || article.title,
          description: llmResult.description || article.description,
          url: normalizeUrl(article.url),
          category: llmResult.category || 'Code & Development',
          tags: [...(llmResult.tags || []), 'dev.to', ...article.tag_list].slice(0, 8),
          image_url: article.social_image || null,
          release_date: article.published_timestamp.split('T')[0],
          source: 'Dev.to'
        });

        if (error) throw error;
        results.added++;

      } catch (e) {
        results.errors++;
        results.errors_detail.push(`${article.title}: ${e.message}`);
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
});

async function fetchDevToArticles(): Promise<DevToArticle[]> {
  // Fetch articles tagged 'ai' or 'machinelearning'
  const response = await fetch('https://dev.to/api/articles?tag=ai&state=fresh&per_page=30');
  if (!response.ok) throw new Error(`Dev.to API error: ${response.status}`);
  return await response.json();
}

function isRecent(dateString: string): boolean {
  const date = new Date(dateString);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  return date > twoDaysAgo;
}

function isLikelyTool(article: DevToArticle): boolean {
  const text = (article.title + ' ' + article.description).toLowerCase();
  const keywords = ['built', 'create', 'tool', 'library', 'app', 'project', 'launch', 'introducing'];
  return keywords.some(k => text.includes(k));
}