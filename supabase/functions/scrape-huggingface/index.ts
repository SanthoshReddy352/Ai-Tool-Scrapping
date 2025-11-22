import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { isDuplicate, normalizeUrl } from '../utils/deduplication.ts';
import { parseWithLLM } from '../utils/llm.ts';

interface HFSpace {
  id: string;
  likes: number;
  lastModified: string;
  cardData?: {
    title?: string;
    emoji?: string;
    short_description?: string;
  };
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch trending Spaces
    const response = await fetch('https://huggingface.co/api/spaces?sort=likes&direction=-1&limit=25&full=true');
    if (!response.ok) throw new Error('Failed to fetch HF Spaces');
    
    const spaces: HFSpace[] = await response.json();
    const results = { total: spaces.length, added: 0, duplicates: 0, errors: 0 };

    for (const space of spaces) {
      try {
        const spaceUrl = `https://huggingface.co/spaces/${space.id}`;
        const rawName = space.cardData?.title || space.id.split('/')[1];
        const rawDesc = space.cardData?.short_description || `AI Space by ${space.id.split('/')[0]}`;

        // Filter: Ignore older spaces even if they are trending
        // (Checking if modified in last 7 days to catch "active" trending tools)
        const lastMod = new Date(space.lastModified);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        if (lastMod < oneWeekAgo) continue;

        // Deduplication
        if (await isDuplicate(supabase, { name: rawName, url: normalizeUrl(spaceUrl), description: rawDesc })) {
          results.duplicates++;
          continue;
        }

        // LLM Parsing
        const llmResult = await parseWithLLM(rawName, rawDesc);
        
        // HF Spaces are almost always "tools", so we trust them more, 
        // but we still check if LLM thinks it's junk.
        if (!llmResult.is_tool && space.likes < 50) continue;

        const { error } = await supabase.from('ai_tools').insert({
          name: llmResult.name || rawName,
          description: llmResult.description || rawDesc,
          url: normalizeUrl(spaceUrl),
          category: llmResult.category || 'Other',
          tags: [...(llmResult.tags || []), 'hugging-face', 'demo'],
          release_date: lastMod.toISOString().split('T')[0],
          source: 'Hugging Face'
        });

        if (error) throw error;
        results.added++;

      } catch (e) {
        console.error(`Error processing HF Space ${space.id}:`, e);
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