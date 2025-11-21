import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Image, FileText, Code, Video, BarChart, MessageCircle, 
  Zap, Palette, BookOpen, Grid, ChevronRight 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toolsApi } from '@/db/api';
import type { Category } from '@/types/types';

const iconMap: Record<string, React.ReactNode> = {
  'image': <Image className="h-8 w-8" />,
  'file-text': <FileText className="h-8 w-8" />,
  'code': <Code className="h-8 w-8" />,
  'video': <Video className="h-8 w-8" />,
  'bar-chart': <BarChart className="h-8 w-8" />,
  'message-circle': <MessageCircle className="h-8 w-8" />,
  'zap': <Zap className="h-8 w-8" />,
  'palette': <Palette className="h-8 w-8" />,
  'book-open': <BookOpen className="h-8 w-8" />,
  'grid': <Grid className="h-8 w-8" />,
};

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toolCounts, setToolCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const data = await toolsApi.getCategories();
    setCategories(data);
    
    const counts: Record<string, number> = {};
    for (const category of data) {
      const tools = await toolsApi.getToolsByCategory(category.name, 0);
      counts[category.name] = tools.length;
    }
    setToolCounts(counts);
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-b from-primary/10 to-background py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Browse by Category
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore AI tools organized by their primary function and use case. 
            Find the perfect tool for your specific needs.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-8 w-8 mb-4 bg-muted" />
                  <Skeleton className="h-6 w-3/4 mb-2 bg-muted" />
                  <Skeleton className="h-4 w-full bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/?category=${encodeURIComponent(category.name)}`}
              >
                <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 h-full cursor-pointer">
                  <CardHeader>
                    <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                      <div className="text-primary">
                        {iconMap[category.icon || 'grid'] || <Grid className="h-8 w-8" />}
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {category.description || 'Explore tools in this category'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {toolCounts[category.name] || 0} tools
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoriesPage;
