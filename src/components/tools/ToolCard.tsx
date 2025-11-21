import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AITool } from '@/types/types';

interface ToolCardProps {
  tool: AITool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Card className="group hover:shadow-md hover:border-primary/50 transition-all duration-300 flex flex-col h-full overflow-hidden bg-card border-muted/60">
      {/* Compact Header */}
      <CardHeader className="p-4 pb-2 space-y-0">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-2xl font-bold leading-snug line-clamp-1" title={tool.name}>
            {tool.name}
          </CardTitle>
          <Badge variant="outline" className="shrink-0 text-[10px] h-5 px-2 font-normal text-muted-foreground bg-muted/50">
            {tool.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-4 pt-2">
        <CardDescription className="line-clamp-2 sm min-h-[2.5rem] mb-3 text-muted-foreground/80 leading-relaxed">
          {tool.description || 'No description available.'}
        </CardDescription>
        
        {/* Compact Tags */}
        <div className="flex flex-wrap gap-1.5">
          {tool.tags && tool.tags.length > 0 ? (
            <>
              {tool.tags.slice(0, 3).map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/5 text-primary/70 border border-primary/10"
                >
                  {tag}
                </span>
              ))}
              {tool.tags.length > 3 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                  +{tool.tags.length - 3}
                </span>
              )}
            </>
          ) : (
             <span className="text-[10px] text-muted-foreground italic">No tags</span>
          )}
        </div>
      </CardContent>
      
      {/* Compact Footer */}
      <CardFooter className="p-4 pt-0 flex flex-col gap-3 mt-auto">
        <div className="w-full h-px bg-border/40" /> 
        
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/70 w-full">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(tool.release_date)}</span>
          </div>
          <span className="uppercase tracking-wider font-medium opacity-60">
            {tool.source}
          </span>
        </div>
        
        <div className="flex gap-2 w-full">
          <Button asChild variant="secondary" className="flex-1 h-8 text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary shadow-none" size="sm">
            <Link to={`/tool/${tool.id}`}>
              View Details
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-8 w-8 px-0 shrink-0 border border-input hover:bg-accent hover:text-accent-foreground">
            <a 
              href={tool.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Visit Website"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};