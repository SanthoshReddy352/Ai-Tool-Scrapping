import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isDuplicate, normalizeUrl } from '../utils/deduplication.ts';
import { parseWithLLM } from '../utils/llm.ts';

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const githubToken = Deno.env.get('GITHUB_ACCESS_TOKEN');
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'AI-Tool-Scraper/1.0',
      ...(githubToken ? { 'Authorization': `token ${githubToken}` } : {})
    };

    // Search for AI repos created in the last 48 hours
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // FIXED: Removed "stars:>20" filter. 
    // New repos rarely get 20 stars in 48h. We rely on "sort=stars" to get the best ones.
    const query = `topic:ai created:>${twoDaysAgo}`; 
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`;

    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    
    const data = await response.json();
    const results = { total: data.items.length, added: 0, duplicates: 0, errors: 0 };

    for (const repo of data.items) {
      try {
        const toolUrl = repo.html_url;
        
        // Deduplication check before LLM
        if (await isDuplicate(supabase, { name: repo.name, url: normalizeUrl(toolUrl), description: repo.description })) {
          results.duplicates++;
          continue;
        }

        // LLM Parsing
        const llmResult = await parseWithLLM(
          repo.name,
          `${repo.description || ''} \n\n Topics: ${(repo.topics || []).join(', ')}`
        );

        if (!llmResult.is_tool) continue;

        const tags = new Set(llmResult.tags || []);
        tags.add('github');
        tags.add('open-source');
        if (repo.topics) repo.topics.forEach((t: string) => tags.add(t));

        const { error } = await supabase.from('ai_tools').insert({
          name: llmResult.name || repo.name,
          description: llmResult.description || repo.description,
          url: normalizeUrl(toolUrl),
          category: llmResult.category || 'Code & Development',
          tags: Array.from(tags).slice(0, 8),
          release_date: repo.created_at.split('T')[0],
          source: 'GitHub'
        });

        if (error) throw error;
        results.added++;

      } catch (e) {
        console.error(`Error processing repo ${repo.full_name}:`, e);
        results.errors++;
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