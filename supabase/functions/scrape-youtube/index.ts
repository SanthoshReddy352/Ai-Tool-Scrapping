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
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) throw new Error('YOUTUBE_API_KEY not configured');

    // Search for recent videos about new AI tools
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const query = 'new ai tool review';
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&order=date&publishedAfter=${oneDayAgo}&key=${apiKey}&maxResults=200`;

    const response = await fetch(searchUrl);
    const data = await response.json();
    const results = { total: data.items?.length || 0, added: 0, duplicates: 0, errors: 0 };

    if (!data.items) return new Response(JSON.stringify({ success: true, results }));

    for (const item of data.items) {
      try {
        const videoId = item.id.videoId;
        // Fetch full video details to get the description
        const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
        const videoResponse = await fetch(videoDetailsUrl);
        const videoData = await videoResponse.json();
        const snippet = videoData.items[0]?.snippet;

        if (!snippet) continue;

        // Extract first external link from description
        const urlRegex = /https?:\/\/(?!(?:www\.)?(?:youtube\.com|youtu\.be|twitter\.com|facebook\.com|instagram\.com))[^\s]+/g;
        const matches = snippet.description.match(urlRegex);
        
        // If no tool link found, skip
        if (!matches || matches.length === 0) continue;
        const toolUrl = matches[0]; // Assume first link is the tool

        // Use LLM to clean up title/description
        const llmResult = await parseWithLLM(snippet.title, snippet.description);
        if (!llmResult.is_tool) continue;

        if (await isDuplicate(supabase, { name: llmResult.name || snippet.title, url: normalizeUrl(toolUrl), description: llmResult.description })) {
          results.duplicates++;
          continue;
        }

        const { error } = await supabase.from('ai_tools').insert({
          name: llmResult.name || snippet.title,
          description: llmResult.description || snippet.description.substring(0, 200),
          url: normalizeUrl(toolUrl),
          category: llmResult.category || 'Video & Audio',
          tags: [...(llmResult.tags || []), 'youtube', 'review'],
          release_date: snippet.publishedAt.split('T')[0],
          source: 'YouTube'
        });

        if (error) throw error;
        results.added++;
      } catch (e) {
        console.error('YouTube item error:', e);
        results.errors++;
      }
    }

    return new Response(JSON.stringify({ success: true, results }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});