import { supabase } from './supabase';
import type { AITool, Category, ToolFilters } from '@/types/types';

const ITEMS_PER_PAGE = 12;

export const toolsApi = {
  async getTools(page = 0, filters?: ToolFilters): Promise<AITool[]> {
    try {
      let query = supabase
        .from('ai_tools')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tools:', error);
        return [];
      }

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error in getTools:', error);
      return [];
    }
  },

  async getToolById(id: string): Promise<AITool | null> {
    try {
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching tool:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getToolById:', error);
      return null;
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error in getCategories:', error);
      return [];
    }
  },

  async getToolsByCategory(category: string, page = 0): Promise<AITool[]> {
    return this.getTools(page, { category });
  },

  async searchTools(searchTerm: string, page = 0): Promise<AITool[]> {
    return this.getTools(page, { search: searchTerm });
  },

  async getAllTags(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('ai_tools')
        .select('tags');

      if (error) {
        console.error('Error fetching tags:', error);
        return [];
      }

      if (!Array.isArray(data)) return [];

      const allTags = new Set<string>();
      data.forEach((item) => {
        if (Array.isArray(item.tags)) {
          item.tags.forEach((tag) => allTags.add(tag));
        }
      });

      return Array.from(allTags).sort();
    } catch (error) {
      console.error('Error in getAllTags:', error);
      return [];
    }
  },

  async getRecentTools(limit = 6): Promise<AITool[]> {
    try {
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent tools:', error);
        return [];
      }

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error in getRecentTools:', error);
      return [];
    }
  }
};
