import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, Tag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { toolsApi } from '@/db/api';
import type { AITool } from '@/types/types';
import { ToolCard } from '@/components/tools/ToolCard';

const ToolDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tool, setTool] = useState<AITool | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedTools, setRelatedTools] = useState<AITool[]>([]);

  useEffect(() => {
    if (id) {
      loadTool(id);
      window.scrollTo(0, 0);
    }
  }, [id]);

  const loadTool = async (toolId: string) => {
    setLoading(true);
    try {
      const data = await toolsApi.getToolById(toolId);
      setTool(data);
      
      if (data) {
        const related = await toolsApi.getToolsByCategory(data.category, 0);
        // Fetch enough items to fill the wider horizontal space
        setRelatedTools(related.filter(t => t.id !== toolId).slice(0, 8));
      }
    } catch (error) {
      console.error("Failed to load tool details:", error);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-32 mb-8 bg-muted" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-12 w-2/3 mb-4 bg-muted" />
              <Skeleton className="h-64 w-full bg-muted" />
            </div>
            <div>
              <Skeleton className="h-64 w-full bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Tool Not Found</h2>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8"> {/* Increased max-width slightly for better layout */}
        
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-8">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Link>
        </Button>

        {/* Top Section: Split between Main Info and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Left Column: Main Description & Tags */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                    {tool.name}
                  </h1>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {tool.category}
                  </Badge>
                </div>
                <Button asChild size="lg" className="shrink-0">
                  <a 
                    href={tool.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Visit Website
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {tool.description || 'No description available for this tool.'}
                </p>
              </div>
            </div>

            {/* Tags Section */}
            {tool.tags && tool.tags.length > 0 && (
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="px-3 py-1 text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tool Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Release Date</div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(tool.release_date)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Source</div>
                  <div className="text-foreground capitalize">{tool.source}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Category</div>
                  <Badge variant="secondary">{tool.category}</Badge>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Website</div>
                  <a 
                    href={tool.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm break-all block"
                  >
                    {tool.url}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section: Related Tools (Full Width) */}
        {relatedTools.length > 0 && (
          <div className="border-t pt-8 w-full">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Related Tools
            </h2>
            
            {/* Scroll Area spans full container width now */}
            <ScrollArea className="w-full whitespace-nowrap pb-4">
              <div className="flex w-max space-x-6 p-1 pb-4">
                {relatedTools.map((relatedTool) => (
                  <div key={relatedTool.id} className="w-[320px]" style={{ aspectRatio: '1 / 1' }}>
                    <ToolCard tool={relatedTool} />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

      </div>
    </div>
  );
};

export default ToolDetailPage;