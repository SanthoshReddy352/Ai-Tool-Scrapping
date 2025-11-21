export interface AITool {
  id: string;
  name: string;
  description: string | null;
  url: string;
  category: string;
  tags: string[];
  image_url: string | null;
  release_date: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface ToolFilters {
  category?: string;
  tags?: string[];
  search?: string;
}
