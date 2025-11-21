/*
# Add Scraping Logs Table

This migration creates a table to track automated scraping runs and their results.

## New Tables

### `scraping_logs`
Stores information about each scraping run for monitoring and debugging.

**Columns:**
- `id` (uuid, PK): Unique identifier
- `run_date` (timestamptz): When the scraping run occurred
- `summary` (jsonb): Summary statistics (tools added, duplicates, errors)
- `details` (jsonb): Detailed results from each scraper
- `created_at` (timestamptz): Record creation timestamp

## Indexes
- `idx_scraping_logs_run_date`: For querying by date

## Security
- Public read access for monitoring
- Only service role can write (via Edge Functions)
*/

CREATE TABLE IF NOT EXISTS scraping_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date timestamptz NOT NULL,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  details jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_scraping_logs_run_date ON scraping_logs(run_date DESC);

ALTER TABLE scraping_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to scraping logs"
  ON scraping_logs FOR SELECT
  TO public
  USING (true);
