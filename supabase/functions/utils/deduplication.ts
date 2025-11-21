import { createClient } from 'npm:@supabase/supabase-js@2';

interface ToolData {
  name: string;
  url: string;
  description?: string;
}

export async function isDuplicate(
  supabase: ReturnType<typeof createClient>,
  tool: ToolData
): Promise<boolean> {
  // Check 1: Exact URL match
  const { data: urlMatch } = await supabase
    .from('ai_tools')
    .select('id')
    .eq('url', tool.url)
    .maybeSingle();

  if (urlMatch) {
    return true;
  }

  // Check 2: Exact name match
  const { data: nameMatch } = await supabase
    .from('ai_tools')
    .select('id, name')
    .ilike('name', tool.name)
    .maybeSingle();

  if (nameMatch) {
    return true;
  }

  // Check 3: Fuzzy name matching (Levenshtein distance)
  const { data: allTools } = await supabase
    .from('ai_tools')
    .select('id, name, url');

  if (allTools) {
    for (const existingTool of allTools) {
      const similarity = calculateSimilarity(tool.name.toLowerCase(), existingTool.name.toLowerCase());
      
      // If names are very similar (>85% match), consider it a duplicate
      if (similarity > 0.85) {
        return true;
      }

      // Check if URLs are from the same domain
      if (isSameDomain(tool.url, existingTool.url)) {
        return true;
      }
    }
  }

  return false;
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

function isSameDomain(url1: string, url2: string): boolean {
  try {
    const domain1 = new URL(url1).hostname.replace('www.', '');
    const domain2 = new URL(url2).hostname.replace('www.', '');
    return domain1 === domain2;
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove trailing slashes and common tracking parameters
    urlObj.pathname = urlObj.pathname.replace(/\/$/, '');
    urlObj.search = '';
    urlObj.hash = '';
    return urlObj.toString();
  } catch {
    return url;
  }
}
