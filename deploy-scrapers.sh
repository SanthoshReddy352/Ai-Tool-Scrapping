#!/bin/bash

# AI Tools Discovery Platform - Scraper Deployment Script
# This script deploys all Edge Functions for automated web scraping

set -e

echo "🚀 AI Tools Discovery Platform - Scraper Deployment"
echo "=================================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if we're linked to a project
if [ ! -f ".supabase/config.toml" ]; then
    echo "❌ Error: Not linked to a Supabase project"
    echo "Run: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "✅ Linked to Supabase project"
echo ""

# Deploy Edge Functions
echo "📦 Deploying Edge Functions..."
echo ""

echo "1️⃣  Deploying scrape-producthunt..."
supabase functions deploy scrape-producthunt --no-verify-jwt
echo "✅ scrape-producthunt deployed"
echo ""

echo "2️⃣  Deploying scrape-reddit..."
supabase functions deploy scrape-reddit --no-verify-jwt
echo "✅ scrape-reddit deployed"
echo ""

echo "3️⃣  Deploying scrape-rss..."
supabase functions deploy scrape-rss --no-verify-jwt
echo "✅ scrape-rss deployed"
echo ""

echo "4️⃣  Deploying scrape-orchestrator..."
supabase functions deploy scrape-orchestrator --no-verify-jwt
echo "✅ scrape-orchestrator deployed"
echo ""

echo "=================================================="
echo "✅ All scrapers deployed successfully!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Set up API keys (required):"
echo "   supabase secrets set PRODUCTHUNT_API_TOKEN=your_token"
echo ""
echo "2. Set up Reddit credentials (optional):"
echo "   supabase secrets set REDDIT_CLIENT_ID=your_id"
echo "   supabase secrets set REDDIT_CLIENT_SECRET=your_secret"
echo ""
echo "3. Test the orchestrator:"
echo "   curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/scrape-orchestrator \\"
echo "     -H 'Authorization: Bearer YOUR_ANON_KEY'"
echo ""
echo "4. Set up hourly cron job in Supabase Dashboard"
echo ""
echo "📚 See SCRAPING_SETUP.md for detailed instructions"
echo ""
