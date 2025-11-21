# Sample Data Information

## Overview
This AI Tools Discovery Platform has been initialized with sample data to demonstrate its functionality. The sample data includes 10 AI tools across various categories.

## Sample Tools Included

The following AI tools have been added to the database:

1. **MidJourney** - Image Generation
   - AI art generator for creating stunning images from text descriptions
   - Tags: art, image, creative, design

2. **ChatGPT** - Chatbots & Assistants
   - Advanced conversational AI for writing, coding, and analysis
   - Tags: chat, assistant, writing, coding

3. **GitHub Copilot** - Code & Development
   - AI pair programmer with intelligent code suggestions
   - Tags: coding, development, productivity, github

4. **Runway ML** - Video & Audio
   - AI-powered video editing and generation platform
   - Tags: video, editing, creative, filmmaking

5. **Jasper AI** - Text & Writing
   - AI writing assistant for marketing copy and content
   - Tags: writing, marketing, content, copywriting

6. **Tableau AI** - Data Analysis
   - AI-enhanced data analytics and visualization platform
   - Tags: analytics, data, visualization, business

7. **Notion AI** - Productivity
   - AI-powered workspace for writing and organizing
   - Tags: productivity, workspace, writing, organization

8. **Canva AI** - Design & Creative
   - AI-powered design platform with smart templates
   - Tags: design, graphics, templates, creative

9. **Perplexity AI** - Research & Education
   - AI-powered search engine with cited sources
   - Tags: search, research, education, learning

10. **ElevenLabs** - Video & Audio
    - AI voice synthesis for realistic text-to-speech
    - Tags: audio, voice, speech, synthesis

## Categories

The following categories have been created:

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

## Managing Sample Data

### Option 1: Keep the Sample Data
The sample data provides a good demonstration of the platform's capabilities and can serve as a reference for the data structure when adding real tools.

### Option 2: Remove Sample Data
If you prefer to start with a clean database, you can remove the sample data by running the following SQL in your Supabase SQL Editor:

```sql
-- Remove sample tools
DELETE FROM ai_tools;

-- Optionally, keep the categories or remove them too
-- DELETE FROM categories;
```

### Option 3: Add More Data
You can add more tools through the Supabase dashboard or by creating additional migration files. The data structure for each tool includes:

- `name` (required): Tool name
- `description`: Detailed description
- `url` (required): Official website URL
- `category` (required): Primary category
- `tags`: Array of tags
- `image_url`: Tool thumbnail/logo URL
- `release_date`: Official release date
- `source` (required): Discovery source

## Future Data Collection

In a production environment, the platform would use automated scraping via Supabase Edge Functions to collect data from:

- AI directories (ProductHunt, Futurepedia, etc.)
- Tech news outlets (TechCrunch, The Verge, etc.)
- Social platforms (Reddit r/artificial, r/MachineLearning)

The scraping would run on an hourly schedule, with intelligent deduplication and automatic categorization.

## Notes

- All sample data uses publicly available information about well-known AI tools
- Images are sourced from Unsplash for demonstration purposes
- Release dates are fictional and used for demonstration
- The data structure is designed to be easily extensible for real-world use
