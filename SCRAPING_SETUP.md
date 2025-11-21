# Automated Web Scraping Setup Guide

## Overview

The AI Tools Discovery Platform includes automated web scraping functionality implemented using Supabase Edge Functions. This system collects AI tool information from multiple sources hourly.

## Architecture

### Components

1. **Scrape Orchestrator** (`scrape-orchestrator`)
   - Main coordinator that runs all scrapers sequentially
   - Manages timing and rate limiting
   - Logs results to database
   - Calculates summary statistics

2. **ProductHunt Scraper** (`scrape-producthunt`)
   - Uses ProductHunt GraphQL API
   - Fetches latest 20 posts
   - Filters for AI-related tools
   - Extracts topics as tags

3. **Reddit Scraper** (`scrape-reddit`)
   - Monitors r/artificial, r/MachineLearning, r/ArtificialIntelligence
   - Supports both OAuth and public API
   - Extracts tool URLs from posts
   - Identifies tool announcements

4. **RSS Feed Scraper** (`scrape-rss`)
   - Monitors TechCrunch AI, The Verge AI, VentureBeat AI
   - Parses RSS feeds
   - Extracts tool URLs from articles
   - Identifies launch announcements

5. **Utility Functions**
   - **Deduplication**: URL matching, fuzzy name matching, domain comparison
   - **Categorization**: Automatic category assignment based on keywords
   - **Retry Logic**: Exponential backoff with 3 retry attempts

## Deployment

### Step 1: Deploy Edge Functions

Deploy each Edge Function to Supabase:

```bash
# Deploy ProductHunt scraper
supabase functions deploy scrape-producthunt

# Deploy Reddit scraper
supabase functions deploy scrape-reddit

# Deploy RSS scraper
supabase functions deploy scrape-rss

# Deploy orchestrator
supabase functions deploy scrape-orchestrator
```

### Step 2: Configure API Keys

Set up the required API keys in Supabase Secrets:

```bash
# ProductHunt API Token (required)
supabase secrets set PRODUCTHUNT_API_TOKEN=your_token_here

# Reddit API Credentials (optional, falls back to public API)
supabase secrets set REDDIT_CLIENT_ID=your_client_id
supabase secrets set REDDIT_CLIENT_SECRET=your_client_secret
```

### Step 3: Set Up Cron Schedule

Configure Supabase Cron to run the orchestrator hourly:

1. Go to Supabase Dashboard → Database → Cron Jobs
2. Create a new cron job:
   - **Name**: Hourly AI Tools Scraping
   - **Schedule**: `0 * * * *` (every hour at minute 0)
   - **Function**: `scrape-orchestrator`
   - **Enabled**: Yes

Alternatively, use SQL:

```sql
SELECT cron.schedule(
  'hourly-ai-tools-scraping',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/scrape-orchestrator',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);
```

## API Key Setup

### ProductHunt API Token

1. Go to https://www.producthunt.com/v2/oauth/applications
2. Create a new application
3. Copy the API token
4. Set in Supabase Secrets: `PRODUCTHUNT_API_TOKEN`

**Required**: Yes (ProductHunt scraper will fail without it)

### Reddit API Credentials

1. Go to https://www.reddit.com/prefs/apps
2. Create a new app (select "script" type)
3. Copy the client ID and secret
4. Set in Supabase Secrets: `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET`

**Required**: No (falls back to public API, but rate limited)

## Testing

### Manual Testing

Test each scraper individually:

```bash
# Test ProductHunt scraper
curl -X POST https://your-project.supabase.co/functions/v1/scrape-producthunt \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test Reddit scraper
curl -X POST https://your-project.supabase.co/functions/v1/scrape-reddit \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test RSS scraper
curl -X POST https://your-project.supabase.co/functions/v1/scrape-rss \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test orchestrator
curl -X POST https://your-project.supabase.co/functions/v1/scrape-orchestrator \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Expected Response

```json
{
  "success": true,
  "results": {
    "total": 25,
    "added": 5,
    "duplicates": 18,
    "errors": 2,
    "errors_detail": []
  }
}
```

## Monitoring

### View Scraping Logs

Query the `scraping_logs` table to monitor scraping runs:

```sql
SELECT 
  run_date,
  summary->>'total_tools_added' as tools_added,
  summary->>'total_duplicates' as duplicates,
  summary->>'total_errors' as errors,
  summary->>'total_duration' as duration_ms
FROM scraping_logs
ORDER BY run_date DESC
LIMIT 10;
```

### Check Recent Tools

View recently added tools:

```sql
SELECT 
  name,
  category,
  source,
  created_at
FROM ai_tools
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## Deduplication Strategy

The system uses a three-tier deduplication approach:

### 1. URL Matching (Primary)
- Exact URL comparison after normalization
- Removes trailing slashes and query parameters
- Most reliable method

### 2. Fuzzy Name Matching (Secondary)
- Levenshtein distance algorithm
- 85% similarity threshold
- Catches tools with slightly different names

### 3. Domain Comparison (Tertiary)
- Compares base domains
- Prevents duplicate entries from same website
- Removes www. prefix for comparison

## Categorization

Tools are automatically categorized using keyword matching:

### Categories and Keywords

- **Image Generation**: image, photo, art, visual, midjourney, dalle
- **Text & Writing**: text, writing, content, gpt, copywriting
- **Code & Development**: code, programming, developer, github, copilot
- **Video & Audio**: video, audio, voice, speech, tts
- **Data Analysis**: data, analytics, visualization, statistics
- **Chatbots & Assistants**: chatbot, chat, assistant, bot
- **Productivity**: productivity, workflow, automation, task
- **Design & Creative**: design, creative, ui, ux, prototype
- **Research & Education**: research, education, learning, academic

Tools that don't match any category are assigned to "Other".

## Rate Limiting

### Built-in Protections

1. **Sequential Execution**: Scrapers run one at a time
2. **Delays**: 2-second delay between scrapers
3. **Retry Logic**: Exponential backoff (1s, 2s, 4s)
4. **Rate Limit Detection**: Automatic detection and handling

### API Limits

- **ProductHunt**: 500 requests/hour (with token)
- **Reddit OAuth**: 60 requests/minute
- **Reddit Public**: 10 requests/minute
- **RSS Feeds**: No official limit (be respectful)

## Error Handling

### Retry Mechanism

All scrapers implement retry logic:
- Maximum 3 attempts
- Exponential backoff (1s, 2s, 4s)
- Logs all failures

### Error Logging

Errors are logged in two places:
1. **Scraping Logs Table**: Summary and details
2. **Edge Function Logs**: Detailed error messages

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ProductHunt API token not configured` | Missing API key | Set `PRODUCTHUNT_API_TOKEN` secret |
| `Reddit API error: 429` | Rate limited | Wait or use OAuth credentials |
| `RSS fetch error: 403` | Blocked by website | Use proxy or reduce frequency |
| `Duplicate tool detected` | Tool already exists | Normal behavior, not an error |

## Performance

### Expected Results

Per hourly run:
- **Total items checked**: 50-100
- **New tools added**: 2-10
- **Duplicates filtered**: 40-90
- **Execution time**: 30-60 seconds

### Optimization Tips

1. **Reduce Frequency**: If hitting rate limits, reduce to every 2-4 hours
2. **Add More Sources**: Expand to more AI directories
3. **Improve Filtering**: Refine AI-related detection keywords
4. **Batch Processing**: Process multiple items in parallel (with caution)

## Troubleshooting

### No Tools Being Added

**Possible causes:**
1. All tools are duplicates (check `duplicates` count)
2. Filtering is too strict (check `isAIRelated` logic)
3. API keys are invalid (check secrets)
4. Sources have changed their structure (update parsers)

**Solutions:**
- Review scraping logs for details
- Test scrapers individually
- Check Edge Function logs
- Verify API keys are valid

### High Error Rate

**Possible causes:**
1. Rate limiting from sources
2. Invalid API credentials
3. Network issues
4. Source website changes

**Solutions:**
- Reduce scraping frequency
- Verify API credentials
- Check Edge Function logs for specific errors
- Update parsers if source structure changed

### Duplicate Detection Not Working

**Possible causes:**
1. URLs are not normalized properly
2. Tool names vary significantly
3. Similarity threshold too low

**Solutions:**
- Review `normalizeUrl` function
- Adjust similarity threshold (currently 85%)
- Add manual deduplication rules

## Extending the System

### Adding New Sources

1. Create new Edge Function:
```bash
mkdir supabase/functions/scrape-newsource
```

2. Implement scraper following existing patterns

3. Add to orchestrator:
```typescript
const scrapers = [
  // ... existing scrapers
  { name: 'New Source', function: 'scrape-newsource' }
];
```

4. Deploy:
```bash
supabase functions deploy scrape-newsource
```

### Customizing Categorization

Edit `utils/categorization.ts`:

```typescript
const categoryKeywords: CategoryKeywords = {
  'Your Category': ['keyword1', 'keyword2', 'keyword3']
};
```

### Adjusting Deduplication

Edit `utils/deduplication.ts`:

```typescript
// Adjust similarity threshold
if (similarity > 0.90) { // Changed from 0.85
  return true;
}
```

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use Supabase Secrets** for all credentials
3. **Implement rate limiting** to avoid bans
4. **Respect robots.txt** when scraping
5. **Use service role key** only in Edge Functions
6. **Monitor for abuse** via scraping logs

## Cost Considerations

### Supabase Edge Functions
- **Free tier**: 500,000 invocations/month
- **Hourly scraping**: ~2,920 invocations/month (well within free tier)

### Database Storage
- **Free tier**: 500 MB
- **Expected growth**: ~1-2 MB/month for tools data
- **Logs retention**: Consider archiving old logs after 30 days

### Bandwidth
- **Free tier**: 5 GB/month
- **Expected usage**: <100 MB/month

## Maintenance

### Regular Tasks

1. **Weekly**: Review scraping logs for errors
2. **Monthly**: Check for new AI tool sources
3. **Quarterly**: Update keyword lists for categorization
4. **As needed**: Update parsers if sources change

### Monitoring Checklist

- [ ] Scraping runs completing successfully
- [ ] New tools being added regularly
- [ ] Error rate below 10%
- [ ] No rate limiting issues
- [ ] API keys still valid
- [ ] Database storage within limits

## Support

For issues or questions:
1. Check Edge Function logs in Supabase Dashboard
2. Review scraping logs table
3. Test scrapers individually
4. Verify API credentials
5. Check source websites for changes

## Future Enhancements

Potential improvements:
- [ ] Add more AI directories (Futurepedia, There's an AI For That)
- [ ] Implement AI-powered categorization using LLM
- [ ] Add screenshot capture for tools
- [ ] Implement trending algorithm
- [ ] Add email notifications for new tools
- [ ] Create admin dashboard for monitoring
- [ ] Add manual tool submission workflow
- [ ] Implement tool verification system
