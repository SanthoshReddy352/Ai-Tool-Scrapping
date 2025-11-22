import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

interface ScraperResult {
  scraper: string;
  success: boolean;
  results?: any;
  error?: string;
  duration: number;
}

serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting scraping orchestrator...');

    // ADDED: scrape-devto and scrape-huggingface
    const scrapers = [
      { name: 'ProductHunt', function: 'scrape-producthunt' },
      { name: 'Reddit', function: 'scrape-reddit' },
      { name: 'Hacker News', function: 'scrape-hackernews' },
      { name: 'GitHub', function: 'scrape-github' },
      { name: 'YouTube', function: 'scrape-youtube' },
      { name: 'RSS Feeds', function: 'scrape-rss' },
      { name: 'Dev.to', function: 'scrape-devto' },
      { name: 'Hugging Face', function: 'scrape-huggingface' }
    ];

    const results: ScraperResult[] = [];

    // Run scrapers sequentially
    for (const scraper of scrapers) {
      const scraperStartTime = Date.now();
      
      try {
        console.log(`Running ${scraper.name} scraper...`);
        
        const { data, error } = await supabase.functions.invoke(scraper.function, {
          body: {}
        });

        const duration = Date.now() - scraperStartTime;

        if (error) {
          results.push({
            scraper: scraper.name,
            success: false,
            error: error.message,
            duration
          });
          console.error(`${scraper.name} scraper failed:`, error);
        } else {
          results.push({
            scraper: scraper.name,
            success: true,
            results: data,
            duration
          });
          console.log(`${scraper.name} scraper completed in ${duration}ms`);
        }
      } catch (error) {
        const duration = Date.now() - scraperStartTime;
        results.push({
          scraper: scraper.name,
          success: false,
          error: error.message,
          duration
        });
        console.error(`${scraper.name} scraper error:`, error);
      }

      // Wait 2 seconds between scrapers to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Calculate summary statistics
    const summary = {
      total_duration: Date.now() - startTime,
      scrapers_run: results.length,
      scrapers_successful: results.filter(r => r.success).length,
      scrapers_failed: results.filter(r => !r.success).length,
      total_tools_added: results.reduce((sum, r) => 
        sum + (r.results?.results?.added || 0), 0
      ),
      total_duplicates: results.reduce((sum, r) => 
        sum + (r.results?.results?.duplicates || 0), 0
      ),
      total_errors: results.reduce((sum, r) => 
        sum + (r.results?.results?.errors || 0), 0
      )
    };

    // Log scraping run to database
    const { error: logError } = await supabase.from('scraping_logs').insert({
      run_date: new Date().toISOString(),
      summary,
      details: results
    });

    if (logError) {
      console.error('Failed to log scraping run:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        results
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Orchestrator error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});