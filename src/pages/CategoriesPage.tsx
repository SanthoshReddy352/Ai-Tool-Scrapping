import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Image, FileText, Code, Video, BarChart, MessageCircle, 
  Zap, Palette, BookOpen, Grid, ChevronRight 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FadeInWhenVisible } from '@/components/animations/FadeInWhenVisible';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';
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
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-16 px-4 overflow-hidden">
        <motion.div
          className="absolute top-10 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <FadeInWhenVisible direction="down" duration={0.6}>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Browse by Category
            </h1>
          </FadeInWhenVisible>
          <FadeInWhenVisible delay={0.2} duration={0.6}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore AI tools organized by their primary function and use case. 
              Find the perfect tool for your specific needs.
            </p>
          </FadeInWhenVisible>
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
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
            {categories.map((category) => (
              <StaggerItem key={category.id}>
                <Link
                  to={`/?category=${encodeURIComponent(category.name)}`}
                >
                  <motion.div
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:border-primary/30 h-full cursor-pointer relative overflow-hidden">
                      {/* Gradient overlay on hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      
                      <CardHeader className="relative z-10">
                        <motion.div 
                          className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors"
                          whileHover={{ 
                            scale: 1.1, 
                            rotate: [0, -5, 5, 0],
                            transition: { duration: 0.5 }
                          }}
                        >
                          <div className="text-primary">
                            {iconMap[category.icon || 'grid'] || <Grid className="h-8 w-8" />}
                          </div>
                        </motion.div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {category.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {category.description || 'Explore tools in this category'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="flex items-center justify-between">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Badge variant="secondary" className="group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              {toolCounts[category.name] || 0} tools
                            </Badge>
                          </motion.div>
                          <motion.div
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all" />
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>
    </div>
  );
};

export default CategoriesPage;
