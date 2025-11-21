import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Calendar, Tag } from 'lucide-react';
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
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col h-full">
      <CardHeader className="p-0">
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-muted">
          {tool.image_url ? (
            <img
              src={tool.image_url}
              alt={tool.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-4xl text-muted-foreground">🤖</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
              {tool.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg mb-2 line-clamp-1">
          {tool.name}
        </CardTitle>
        <CardDescription className="line-clamp-3 text-sm">
          {tool.description || 'No description available'}
        </CardDescription>
        
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tool.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tool.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tool.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(tool.release_date)}</span>
          <span className="ml-auto text-xs">via {tool.source}</span>
        </div>
        
        <div className="flex gap-2 w-full">
          <Button asChild variant="default" className="flex-1" size="sm">
            <Link to={`/tool/${tool.id}`}>
              View Details
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a 
              href={tool.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
