import { useEffect, useState } from 'react';
import { supabase } from '@/db/supabase';
import { Tool } from '@/types';
import ToolCard from './ToolCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface RelatedToolsProps {
  currentToolId: number;
  category: string;
  tags?: string[];
}

export function RelatedTools({ currentToolId, category, tags }: RelatedToolsProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedTools() {
      try {
        // fetch tools in the same category, excluding current tool
        let query = supabase
          .from('ai_tools')
          .select('*')
          .eq('category', category)
          .neq('id', currentToolId)
          .limit(4); // Limit to 4 related tools

        // Optional: You could enhance this to filter by matching tags if needed
        
        const { data, error } = await query;

        if (error) throw error;
        setTools(data || []);
      } catch (error) {
        console.error('Error fetching related tools:', error);
      } finally {
        setLoading(false);
      }
    }

    if (category) {
      fetchRelatedTools();
    }
  }, [category, currentToolId]);

  if (loading) {
    return <div className="flex gap-4 overflow-hidden"><Skeleton className="h-[300px] w-[250px]" /><Skeleton className="h-[300px] w-[250px]" /><Skeleton className="h-[300px] w-[250px]" /></div>;
  }

  if (tools.length === 0) return null;

  return (
    <div className="mt-12 space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Related Tools</h2>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div className="flex w-max space-x-4 p-4">
          {tools.map((tool) => (
            <div key={tool.id} className="w-[300px] shrink-0"> 
               {/* Wrapper div to control width in horizontal scroll */}
              <ToolCard tool={tool} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}