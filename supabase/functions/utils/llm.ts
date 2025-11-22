import { GoogleGenerativeAI } from 'npm:@google/generative-ai';
import { cleanDescription, categorizeToolAuto, extractTags } from './categorization.ts';

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
      model: 'gemini-2.5-flash-lite',
      generationConfig: { 
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });

    const prompt = `
      You are an AI Tools extractor. Analyze the text provided. 
      1. Determine if it describes a specific software tool, library, or AI model.
      2. If yes, extract the Name, a Summary (max 2 sentences), Category, and 3-5 Tags.
      3. Return strictly valid JSON.

      Title: ${title}
      Content: ${content}

      JSON Schema:
      { "is_tool": boolean, "name": string, "description": string, "category": string, "tags": string[] }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini 2.5 Flash Lite parsing failed, falling back to heuristics:', error);
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