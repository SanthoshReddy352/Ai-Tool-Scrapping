import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Image, FileText, Code, Video, BarChart, MessageCircle, 
  Zap, Palette, BookOpen, Grid, ChevronRight, Sparkles, TrendingUp 
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
      <section className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20 px-4 overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-10 right-20 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 left-20 w-96 h-96 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <FadeInWhenVisible direction="down" duration={0.6}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <motion.div
                className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl"
                animate={{ 
                  rotate: [0, 360],
                }}
                transition={{ 
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Grid className="h-10 w-10 text-white" />
              </motion.div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              Browse by <span className="gradient-text">Category</span>
            </h1>
          </FadeInWhenVisible>
          <FadeInWhenVisible delay={0.2} duration={0.6}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore AI tools organized by their primary function and use case. 
              <span className="text-primary font-semibold"> Find the perfect tool</span> for your specific needs.
            </p>
          </FadeInWhenVisible>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="hover-lift">
                <CardHeader>
                  <Skeleton className="h-12 w-12 mb-4 bg-muted rounded-xl" />
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
            {categories.map((category, index) => (
              <StaggerItem key={category.id}>
                <Link
                  to={`/?category=${encodeURIComponent(category.name)}`}
                  data-testid={`category-card-${category.name}`}
                >
                  <motion.div
                    whileHover={{ y: -12, transition: { duration: 0.3 } }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:border-primary/50 h-full cursor-pointer relative overflow-hidden border-2">
                      {/* Animated gradient overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                      
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                      />
                      
                      <CardHeader className="relative z-10 pb-4">
                        <motion.div 
                          className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl w-fit mb-4 border-2 border-primary/20 group-hover:border-primary/40 transition-all"
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
                        <CardTitle className="text-2xl group-hover:text-primary transition-colors mb-2">
                          {category.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-base">
                          {category.description || 'Explore tools in this category'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="flex items-center justify-between">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Badge 
                              variant="secondary" 
                              className="text-sm px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 border border-primary/20 text-primary font-semibold transition-all"
                            >
                              {toolCounts[category.name] || 0} tools
                            </Badge>
                          </motion.div>
                          <motion.div
                            animate={{ 
                              x: [0, 5, 0],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="text-primary"
                          >
                            <ChevronRight className="h-6 w-6" />
                          </motion.div>
                        </div>
                      </CardContent>

                      {/* Corner decorations */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-accent/10 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity" />
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
