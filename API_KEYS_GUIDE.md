# API Keys Setup Guide

This guide explains how to obtain and configure the API keys required for automated web scraping.

## Required API Keys

### 1. ProductHunt API Token ⭐ REQUIRED

ProductHunt provides an official API for accessing their data.

#### How to Get It:

1. **Create a ProductHunt Account**
   - Go to https://www.producthunt.com/
   - Sign up or log in

2. **Create an API Application**
   - Visit https://www.producthunt.com/v2/oauth/applications
   - Click "Create an application"
   - Fill in the details:
     - **Name**: AI Tools Discovery Platform
     - **Redirect URI**: https://localhost (not used for our case)
     - **Description**: Automated tool discovery system

3. **Get Your API Token**
   - After creating the app, you'll see your API token
   - Copy the token (it looks like: `abc123def456...`)

4. **Set in Supabase**
   ```bash
   supabase secrets set PRODUCTHUNT_API_TOKEN=your_token_here
   ```

#### API Limits:
- **Free tier**: 500 requests/hour
- **Our usage**: ~1 request/hour (well within limits)

#### Documentation:
- https://api.producthunt.com/v2/docs

---

## Optional API Keys

### 2. Reddit API Credentials (Optional)

Reddit API credentials improve rate limits but are not required. The scraper will fall back to the public API if credentials are not provided.

#### How to Get It:

1. **Create a Reddit Account**
   - Go to https://www.reddit.com/
   - Sign up or log in

2. **Create an App**
   - Visit https://www.reddit.com/prefs/apps
   - Scroll to "Developed Applications"
   - Click "Create App" or "Create Another App"

3. **Fill in App Details**
   - **Name**: AI Tools Discovery
   - **App type**: Select "script"
   - **Description**: Automated AI tool discovery
   - **About URL**: (leave blank)
   - **Redirect URI**: http://localhost:8000 (required but not used)

4. **Get Your Credentials**
   - After creating, you'll see:
     - **Client ID**: Under the app name (looks like: `abc123def456`)
     - **Secret**: Labeled as "secret" (looks like: `xyz789uvw012`)

5. **Set in Supabase**
   ```bash
   supabase secrets set REDDIT_CLIENT_ID=your_client_id
   supabase secrets set REDDIT_CLIENT_SECRET=your_secret
   ```

#### API Limits:
- **With OAuth**: 60 requests/minute
- **Without OAuth**: 10 requests/minute
- **Our usage**: ~3 requests/hour

#### Documentation:
- https://www.reddit.com/dev/api/

---

## Setting Secrets in Supabase

### Using Supabase CLI

```bash
# Set ProductHunt token (required)
supabase secrets set PRODUCTHUNT_API_TOKEN=your_token_here

# Set Reddit credentials (optional)
supabase secrets set REDDIT_CLIENT_ID=your_client_id
supabase secrets set REDDIT_CLIENT_SECRET=your_secret
```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Click "Add Secret"
4. Enter the secret name and value
5. Click "Save"

### Verify Secrets

```bash
# List all secrets (values are hidden)
supabase secrets list
```

---

## Testing Your Setup

### Test ProductHunt Scraper

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/scrape-producthunt \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Expected response:**
```json
{
  "success": true,
  "results": {
    "total": 20,
    "added": 3,
    "duplicates": 17,
    "errors": 0
  }
}
```

### Test Reddit Scraper

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/scrape-reddit \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Test Full Orchestrator

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/scrape-orchestrator \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## Troubleshooting

### ProductHunt API Errors

**Error: "ProductHunt API token not configured"**
- Solution: Set the `PRODUCTHUNT_API_TOKEN` secret

**Error: "ProductHunt API error: 401"**
- Solution: Your token is invalid or expired. Generate a new one.

**Error: "ProductHunt API error: 429"**
- Solution: Rate limited. Wait an hour or reduce scraping frequency.

### Reddit API Errors

**Error: "Reddit API error: 401"**
- Solution: Check your client ID and secret are correct

**Error: "Reddit API error: 429"**
- Solution: Rate limited. The scraper will automatically fall back to public API.

**No error, but no tools added**
- Solution: This is normal if no new AI tools were posted on Reddit recently

### General Issues

**Error: "Secret not found"**
- Solution: Make sure you've set the secrets using `supabase secrets set`

**Error: "Function not found"**
- Solution: Deploy the Edge Functions using `./deploy-scrapers.sh`

---

## Security Best Practices

### ✅ DO:
- Store API keys in Supabase Secrets
- Use environment variables in Edge Functions
- Rotate keys periodically
- Monitor usage in API provider dashboards

### ❌ DON'T:
- Commit API keys to version control
- Share API keys publicly
- Use production keys for testing
- Hardcode keys in source code

---

## Cost Considerations

### ProductHunt API
- **Free tier**: 500 requests/hour
- **Cost**: Free for our usage
- **Monitoring**: Check usage at https://www.producthunt.com/v2/oauth/applications

### Reddit API
- **Free tier**: Unlimited (with rate limits)
- **Cost**: Free
- **Monitoring**: No official dashboard, monitor via logs

### Supabase Edge Functions
- **Free tier**: 500,000 invocations/month
- **Our usage**: ~2,920/month (hourly scraping)
- **Cost**: Free for our usage

---

## Alternative: Running Without API Keys

If you don't want to set up API keys immediately, you can:

1. **Disable ProductHunt scraper** (requires API key)
   - Comment out in orchestrator

2. **Use Reddit public API** (no credentials needed)
   - Works but with lower rate limits

3. **RSS feeds work without keys**
   - No authentication required

### Modified Orchestrator (No ProductHunt)

Edit `supabase/functions/scrape-orchestrator/index.ts`:

```typescript
const scrapers = [
  // { name: 'ProductHunt', function: 'scrape-producthunt' }, // Disabled
  { name: 'Reddit', function: 'scrape-reddit' },
  { name: 'RSS Feeds', function: 'scrape-rss' }
];
```

---

## Getting Help

### Resources
- **ProductHunt API Docs**: https://api.producthunt.com/v2/docs
- **Reddit API Docs**: https://www.reddit.com/dev/api/
- **Supabase Secrets**: https://supabase.com/docs/guides/functions/secrets

### Support
- Check Edge Function logs in Supabase Dashboard
- Review SCRAPING_SETUP.md for detailed troubleshooting
- Test scrapers individually to isolate issues

---

## Quick Reference

| Secret Name | Required | Where to Get | Purpose |
|-------------|----------|--------------|---------|
| `PRODUCTHUNT_API_TOKEN` | Yes | https://www.producthunt.com/v2/oauth/applications | Fetch ProductHunt posts |
| `REDDIT_CLIENT_ID` | No | https://www.reddit.com/prefs/apps | Reddit OAuth (better rate limits) |
| `REDDIT_CLIENT_SECRET` | No | https://www.reddit.com/prefs/apps | Reddit OAuth (better rate limits) |

---

## Next Steps

After setting up API keys:

1. ✅ Deploy Edge Functions: `./deploy-scrapers.sh`
2. ✅ Set up API keys (this guide)
3. ✅ Test scrapers individually
4. ✅ Test orchestrator
5. ✅ Set up hourly cron job
6. ✅ Monitor scraping logs

See **SCRAPING_SETUP.md** for complete deployment instructions.
