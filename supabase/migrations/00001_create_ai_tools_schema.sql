/*
# AI Tools Discovery Platform - Database Schema

## Overview
This migration creates the core database structure for the AI Tools Discovery Platform,
which tracks and displays newly released AI tools from across the internet.

## 1. New Tables

### `ai_tools`
Main table storing information about AI tools discovered from various sources.

**Columns:**
- `id` (uuid, primary key) - Unique identifier for each tool
- `name` (text, not null) - Name of the AI tool
- `description` (text) - Detailed description of the tool
- `url` (text, not null) - Official website URL
- `category` (text, not null) - Primary category (e.g., "Image Generation", "Text Analysis")
- `tags` (text[]) - Array of tags for additional categorization
- `image_url` (text) - URL to tool thumbnail/logo image
- `release_date` (date) - Official release date of the tool
- `source` (text, not null) - Source where the tool was discovered (e.g., "ProductHunt", "TechCrunch")
- `created_at` (timestamptz, default: now()) - When the record was created
- `updated_at` (timestamptz, default: now()) - When the record was last updated

**Indexes:**
- `idx_ai_tools_release_date` - For sorting by release date
- `idx_ai_tools_category` - For filtering by category
- `idx_ai_tools_created_at` - For sorting by discovery date
- `idx_ai_tools_tags` - GIN index for efficient tag searching

### `categories`
Reference table for valid tool categories.

**Columns:**
- `id` (uuid, primary key) - Unique identifier
- `name` (text, unique, not null) - Category name
- `description` (text) - Category description
- `icon` (text) - Icon identifier for the category
- `created_at` (timestamptz, default: now())

## 2. Security

**Row Level Security (RLS):**
- RLS is NOT enabled on any tables as this is a public discovery platform
- All data is publicly readable
- Write access would be controlled through Edge Functions in production

**Public Access:**
- All users can read all tool data
- This is intentional as the platform is designed for public discovery

## 3. Functions

### `update_updated_at_column()`
Trigger function to automatically update the `updated_at` timestamp when a record is modified.

## 4. Sample Data

Initial categories are inserted to provide structure for tool organization:
- Image Generation
- Text & Writing
- Code & Development
- Video & Audio
- Data Analysis
- Chatbots & Assistants
- Productivity
- Design & Creative
- Research & Education
- Other

## 5. Notes

- The `tags` field uses PostgreSQL array type for flexible categorization
- URLs are stored as text (not validated at database level)
- The platform is designed for public access with no user authentication required
- Future enhancements could add user bookmarking, ratings, or comments
*/

-- Create ai_tools table
CREATE TABLE IF NOT EXISTS ai_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  url text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  image_url text,
  release_date date,
  source text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_tools_release_date ON ai_tools(release_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON ai_tools(category);
CREATE INDEX IF NOT EXISTS idx_ai_tools_created_at ON ai_tools(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_tools_tags ON ai_tools USING GIN(tags);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ai_tools
CREATE TRIGGER update_ai_tools_updated_at
  BEFORE UPDATE ON ai_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial categories
INSERT INTO categories (name, description, icon) VALUES
  ('Image Generation', 'AI tools for creating and editing images', 'image'),
  ('Text & Writing', 'AI tools for writing, editing, and content creation', 'file-text'),
  ('Code & Development', 'AI tools for coding, debugging, and software development', 'code'),
  ('Video & Audio', 'AI tools for video and audio creation and editing', 'video'),
  ('Data Analysis', 'AI tools for analyzing and visualizing data', 'bar-chart'),
  ('Chatbots & Assistants', 'AI-powered chatbots and virtual assistants', 'message-circle'),
  ('Productivity', 'AI tools to enhance productivity and workflow', 'zap'),
  ('Design & Creative', 'AI tools for design, art, and creative work', 'palette'),
  ('Research & Education', 'AI tools for research, learning, and education', 'book-open'),
  ('Other', 'Other AI tools and applications', 'grid')
ON CONFLICT (name) DO NOTHING;

-- Insert sample AI tools for demonstration
INSERT INTO ai_tools (name, description, url, category, tags, image_url, release_date, source) VALUES
  (
    'MidJourney',
    'AI art generator that creates stunning images from text descriptions using advanced machine learning models.',
    'https://www.midjourney.com',
    'Image Generation',
    ARRAY['art', 'image', 'creative', 'design'],
    'https://images.unsplash.com/photo-1686191128892-c1c1e3a0e4b0?w=400&h=300&fit=crop',
    '2024-01-15',
    'ProductHunt'
  ),
  (
    'ChatGPT',
    'Advanced conversational AI that can assist with writing, coding, analysis, and creative tasks.',
    'https://chat.openai.com',
    'Chatbots & Assistants',
    ARRAY['chat', 'assistant', 'writing', 'coding'],
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    '2024-02-01',
    'TechCrunch'
  ),
  (
    'GitHub Copilot',
    'AI pair programmer that helps you write code faster with intelligent code suggestions.',
    'https://github.com/features/copilot',
    'Code & Development',
    ARRAY['coding', 'development', 'productivity', 'github'],
    'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&h=300&fit=crop',
    '2024-01-20',
    'ProductHunt'
  ),
  (
    'Runway ML',
    'AI-powered video editing and generation platform for creators and filmmakers.',
    'https://runwayml.com',
    'Video & Audio',
    ARRAY['video', 'editing', 'creative', 'filmmaking'],
    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop',
    '2024-02-10',
    'The Verge'
  ),
  (
    'Jasper AI',
    'AI writing assistant for creating marketing copy, blog posts, and content at scale.',
    'https://www.jasper.ai',
    'Text & Writing',
    ARRAY['writing', 'marketing', 'content', 'copywriting'],
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
    '2024-01-25',
    'ProductHunt'
  ),
  (
    'Tableau AI',
    'AI-enhanced data analytics and visualization platform for business intelligence.',
    'https://www.tableau.com',
    'Data Analysis',
    ARRAY['analytics', 'data', 'visualization', 'business'],
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    '2024-02-05',
    'VentureBeat'
  ),
  (
    'Notion AI',
    'AI-powered workspace that helps with writing, brainstorming, and organizing information.',
    'https://www.notion.so/product/ai',
    'Productivity',
    ARRAY['productivity', 'workspace', 'writing', 'organization'],
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop',
    '2024-01-30',
    'ProductHunt'
  ),
  (
    'Canva AI',
    'AI-powered design platform with smart templates and automated design suggestions.',
    'https://www.canva.com',
    'Design & Creative',
    ARRAY['design', 'graphics', 'templates', 'creative'],
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    '2024-02-08',
    'ProductHunt'
  ),
  (
    'Perplexity AI',
    'AI-powered search engine that provides accurate answers with cited sources.',
    'https://www.perplexity.ai',
    'Research & Education',
    ARRAY['search', 'research', 'education', 'learning'],
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
    '2024-02-12',
    'TechCrunch'
  ),
  (
    'ElevenLabs',
    'AI voice synthesis platform for creating realistic text-to-speech audio.',
    'https://elevenlabs.io',
    'Video & Audio',
    ARRAY['audio', 'voice', 'speech', 'synthesis'],
    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop',
    '2024-01-28',
    'ProductHunt'
  )
ON CONFLICT DO NOTHING;