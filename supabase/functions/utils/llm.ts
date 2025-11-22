import { GoogleGenerativeAI } from 'npm:@google/generative-ai';
import { cleanDescription, categorizeToolAuto, extractTags, CATEGORIES } from './categorization.ts';

export interface LLMResult {
  is_tool: boolean;
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export async function parseWithLLM(title: string, content: string): Promise<LLMResult> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  
  // Fallback to heuristic methods if no API key
  if (!apiKey) {
    const isTool = checkForToolKeywords(title + ' ' + content);
    if (!isTool) return { is_tool: false };

    return {
      is_tool: true,
      name: title,
      description: cleanDescription(content),
      category: categorizeToolAuto(title, content),
      tags: extractTags(title, content)
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash', 
      generationConfig: { 
        responseMimeType: "application/json",
        temperature: 0.1 // Low temperature for factual extraction
      }
    });

    const prompt = `
      You are an expert AI Software Analyst. Analyze the following text to identify if it describes a software tool.

      Title: ${title}
      Content Snippet: ${content.substring(0, 2500)}

      Instructions:
      1. **Identify**: Does this text describe a specific AI tool, library, or software? (Set "is_tool" to true/false).
      2. **Name**: Extract the *clean, official product name*. 
         - **CRITICAL**: Keep it concise (max 5-6 words). 
         - Remove slogans, taglines, or decorative text (e.g., "SuperTool - The best AI..." -> "SuperTool").
      3. **Description**: Write a professional, objective summary (2-3 sentences) of what the tool DOES.
         - STRICTLY IGNORE promotional fluff (e.g., "Subscribe", "Smash like", "In this video", "I will show you").
         - Focus on features, use cases, and technical capabilities.
      4. **Category**: Assign the best matching category from this list: [${CATEGORIES.join(', ')}]. If none fit perfectly, choose "Other".
      5. **Tags**: Extract 3-5 relevant technical tags (e.g., "LLM", "Video Editing", "Open Source").

      Return strictly valid JSON matching this schema:
      { 
        "is_tool": boolean, 
        "name": string, 
        "description": string, 
        "category": string, 
        "tags": string[] 
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini parsing failed, falling back to heuristics:', error);
    // Fallback
    return {
      is_tool: checkForToolKeywords(title + ' ' + content),
      description: cleanDescription(content),
      category: categorizeToolAuto(title, content),
      tags: extractTags(title, content)
    };
  }
}

function checkForToolKeywords(text: string): boolean {
  const keywords = ['launch', 'release', 'tool', 'library', 'model', 'platform', 'api', 'sdk', 'generator'];
  return keywords.some(k => text.toLowerCase().includes(k));
}