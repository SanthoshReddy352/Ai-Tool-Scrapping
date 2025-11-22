import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isDuplicate, normalizeUrl } from '../utils/deduplication.ts';
import { categorizeToolAuto } from '../utils/categorization.ts';

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
    const query = `topic:ai created:>${twoDaysAgo} stars:>10`; // Minimum 10 stars to filter noise
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20`;

    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    
    const data = await response.json();
    const results = { total: data.items.length, added: 0, duplicates: 0, errors: 0 };

    for (const repo of data.items) {
      try {
        const toolName = repo.name;
        const description = repo.description || `GitHub repository for ${toolName}`;
        const toolUrl = repo.html_url;

        if (await isDuplicate(supabase, { name: toolName, url: normalizeUrl(toolUrl), description })) {
          results.duplicates++;
          continue;
        }

        const category = categorizeToolAuto(toolName, description);
        // Combine GitHub topics with our standard tags
        const tags = [...(repo.topics || []).slice(0, 5), 'github', 'open-source'];

        const { error } = await supabase.from('ai_tools').insert({
          name: toolName,
          description: description,
          url: normalizeUrl(toolUrl),
          category,
          tags: Array.from(new Set(tags)),
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