interface CategoryKeywords {
  [key: string]: string[];
}

const categoryKeywords: CategoryKeywords = {
  'Image Generation': [
    'image', 'photo', 'picture', 'art', 'visual', 'graphic', 'illustration',
    'midjourney', 'dalle', 'stable diffusion', 'generate image', 'create image'
  ],
  'Text & Writing': [
    'text', 'writing', 'content', 'copy', 'article', 'blog', 'essay',
    'gpt', 'writer', 'copywriting', 'generate text', 'write'
  ],
  'Code & Development': [
    'code', 'programming', 'developer', 'coding', 'software', 'github',
    'copilot', 'debug', 'development', 'api', 'function'
  ],
  'Video & Audio': [
    'video', 'audio', 'voice', 'speech', 'sound', 'music', 'podcast',
    'tts', 'text-to-speech', 'voice synthesis', 'video editing'
  ],
  'Data Analysis': [
    'data', 'analytics', 'analysis', 'visualization', 'chart', 'graph',
    'statistics', 'insights', 'business intelligence', 'dashboard'
  ],
  'Chatbots & Assistants': [
    'chatbot', 'chat', 'assistant', 'conversation', 'dialogue', 'bot',
    'virtual assistant', 'ai assistant', 'conversational'
  ],
  'Productivity': [
    'productivity', 'workflow', 'automation', 'task', 'organize',
    'management', 'efficiency', 'workspace', 'collaboration'
  ],
  'Design & Creative': [
    'design', 'creative', 'ui', 'ux', 'interface', 'prototype',
    'mockup', 'template', 'branding', 'logo'
  ],
  'Research & Education': [
    'research', 'education', 'learning', 'study', 'academic', 'search',
    'knowledge', 'discovery', 'analysis', 'paper'
  ]
};

export function categorizeToolAuto(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase();
  const scores: { [key: string]: number } = {};

  // Calculate score for each category
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score++;
      }
    }
    scores[category] = score;
  }

  // Find category with highest score
  let maxScore = 0;
  let bestCategory = 'Other';

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

export function extractTags(name: string, description: string): string[] {
  const text = `${name} ${description}`.toLowerCase();
  const tags = new Set<string>();

  const commonTags = [
    'ai', 'ml', 'machine learning', 'deep learning', 'neural network',
    'automation', 'api', 'saas', 'cloud', 'web', 'mobile',
    'free', 'open source', 'enterprise', 'startup',
    'productivity', 'creative', 'business', 'marketing',
    'analytics', 'visualization', 'generation', 'synthesis'
  ];

  for (const tag of commonTags) {
    if (text.includes(tag)) {
      tags.add(tag);
    }
  }

  // Limit to 5 most relevant tags
  return Array.from(tags).slice(0, 5);
}

export function cleanDescription(description: string): string {
  // Remove excessive whitespace
  let cleaned = description.replace(/\s+/g, ' ').trim();
  
  // Limit length to 500 characters
  if (cleaned.length > 500) {
    cleaned = cleaned.substring(0, 497) + '...';
  }
  
  return cleaned;
}
