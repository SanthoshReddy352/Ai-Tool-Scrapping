import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Sparkles, TrendingUp, Zap, BarChart3, Layers, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolCard } from '@/components/tools/ToolCard';
import { ToolCardSkeleton } from '@/components/tools/ToolCardSkeleton';
import { FadeInWhenVisible } from '@/components/animations/FadeInWhenVisible';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';
import { toolsApi } from '@/db/api';
import type { AITool, Category } from '@/types/types';
import { useDebounce } from '@/hooks/use-debounce';
import { Card, CardContent } from '@/components/ui/card';

const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tools, setTools] = useState<AITool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadTools(true);
  }, [selectedCategory, debouncedSearch]);

  const loadCategories = async () => {
    const data = await toolsApi.getCategories();
    setCategories(data);
  };

  const loadTools = async (reset = false, pageIndex?: number) => {
    const currentPage = reset ? 0 : (pageIndex ?? page);
    
    if (reset) {
      setLoading(true);
      setTools([]);
    } else {
      setLoadingMore(true);
    }

    const filters = {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: debouncedSearch || undefined,
    };

    const data = await toolsApi.getTools(currentPage, filters);
    
    if (reset) {
      setTools(data);
      setPage(0);
    } else {
      setTools(prev => [...prev, ...data]);
    }
    
    setHasMore(data.length === 12);
    setLoading(false);
    setLoadingMore(false);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadTools(false, nextPage);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(0);
    if (value !== 'all') {
      setSearchParams({ category: value });
    } else {
      setSearchParams({});
    }
  };

  // Stats for the stats section
  const stats = [
    { label: 'AI Tools', value: '500+', icon: Layers, color: 'text-primary' },
    { label: 'Categories', value: categories.length.toString(), icon: BarChart3, color: 'text-accent' },
    { label: 'Daily Updates', value: '20+', icon: TrendingUp, color: 'text-success' },
    { label: 'Active Users', value: '10K+', icon: Zap, color: 'text-chart-4' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20 px-4 overflow-hidden">
        {/* Animated background elements with parallax effect */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-chart-4/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <FadeInWhenVisible direction="down" duration={0.6}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <motion.div
                className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl relative overflow-hidden shadow-lg"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="h-10 w-10 text-white relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text text-shadow-lg">
                Discover Amazing
              </span>
              <br />
              <span className="text-foreground">AI Tools</span>
            </h1>
          </FadeInWhenVisible>
          
          <FadeInWhenVisible delay={0.2} duration={0.6}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              Your centralized platform for tracking and discovering newly released AI tools from across the internet. 
              <span className="text-primary font-semibold"> Stay ahead with real-time updates</span> on the latest AI innovations.
            </p>
          </FadeInWhenVisible>
          
          <FadeInWhenVisible delay={0.4} direction="up" duration={0.6}>
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto mb-8">
              <motion.div 
                className="relative flex-1"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search AI tools, categories, or features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 text-base border-2 border-border/50 focus:border-primary transition-all shadow-lg backdrop-blur-sm bg-card/80"
                  data-testid="search-input"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full md:w-[240px] h-14 text-base border-2 border-border/50 focus:border-primary transition-all shadow-lg backdrop-blur-sm bg-card/80" data-testid="category-select">
                    <Filter className="h-5 w-5 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            </div>
          </FadeInWhenVisible>

          <FadeInWhenVisible delay={0.6} duration={0.6}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/categories">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary-hover shadow-lg text-base" data-testid="browse-categories-btn">
                    Browse Categories
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/about">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="outline" className="h-12 px-8 shadow-lg border-2 text-base" data-testid="learn-more-btn">
                    Learn More
                  </Button>
                </motion.div>
              </Link>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 mb-12 relative z-20">
        <FadeInWhenVisible direction="up" duration={0.5}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card className="glass hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      className="inline-block mb-3"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2
                      }}
                    >
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </motion.div>
                    <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </FadeInWhenVisible>
      </section>

      {/* Tools Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <FadeInWhenVisible direction="up" duration={0.5}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg"
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <TrendingUp className="h-6 w-6 text-primary" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">
                  {selectedCategory !== 'all' ? selectedCategory : 'Latest Tools'}
                </h2>
                <p className="text-sm text-muted-foreground">Discover the newest AI innovations</p>
              </div>
            </div>
            <Link to="/categories">
              <motion.div whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="gap-2" data-testid="view-all-categories-btn">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </FadeInWhenVisible>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ToolCardSkeleton key={i} />
            ))}
          </div>
        ) : tools.length === 0 ? (
          <FadeInWhenVisible direction="up" duration={0.5}>
            <div className="text-center py-20">
              <motion.div 
                className="text-7xl mb-6"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                🔍
              </motion.div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">No tools found</h3>
              <p className="text-muted-foreground text-lg">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </FadeInWhenVisible>
        ) : (
          <>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" staggerDelay={0.05}>
              {tools.map((tool) => (
                <StaggerItem key={tool.id}>
                  <ToolCard tool={tool} />
                </StaggerItem>
              ))}
            </StaggerContainer>

            {hasMore && (
              <FadeInWhenVisible delay={0.2} direction="up">
                <div className="flex justify-center mt-12">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={loadMore}
                      disabled={loadingMore}
                      size="lg"
                      variant="outline"
                      className="relative overflow-hidden h-12 px-8 border-2 text-base"
                      data-testid="load-more-btn"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {loadingMore ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Zap className="h-5 w-5" />
                            </motion.div>
                            Loading...
                          </>
                        ) : (
                          'Load More Tools'
                        )}
                      </span>
                      {loadingMore && (
                        <motion.div
                          className="absolute inset-0 bg-primary/10"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </Button>
                  </motion.div>
                </div>
              </FadeInWhenVisible>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default HomePage;
