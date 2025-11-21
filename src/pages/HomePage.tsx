import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Sparkles, TrendingUp } from 'lucide-react';
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

  // UPDATED: Added pageIndex parameter to handle async state updates
  const loadTools = async (reset = false, pageIndex?: number) => {
    // Use the passed pageIndex if available, otherwise fall back to state
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

  // UPDATED: Pass the new page number directly to loadTools
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

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-16 px-4 overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <FadeInWhenVisible direction="down" duration={0.6}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="h-8 w-8 text-primary" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Discover the Latest AI Tools
              </h1>
            </div>
          </FadeInWhenVisible>
          
          <FadeInWhenVisible delay={0.2} duration={0.6}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Your centralized platform for tracking and discovering newly released AI tools from across the internet. 
              Stay ahead with real-time updates on the latest AI innovations.
            </p>
          </FadeInWhenVisible>
          
          <FadeInWhenVisible delay={0.4} direction="up" duration={0.6}>
            <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
              <motion.div 
                className="relative flex-1"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search AI tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-border/50 focus:border-primary transition-colors"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full md:w-[200px] h-12 border-border/50 focus:border-primary transition-colors">
                    <Filter className="h-4 w-4 mr-2" />
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
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <FadeInWhenVisible direction="up" duration={0.5}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <TrendingUp className="h-6 w-6 text-primary" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground">
                {selectedCategory !== 'all' ? selectedCategory : 'Latest Tools'}
              </h2>
            </div>
            <Link to="/categories">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline">
                  Browse Categories
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
            <div className="text-center py-16">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                🔍
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No tools found</h3>
              <p className="text-muted-foreground">
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
                      className="relative overflow-hidden"
                    >
                      <span className="relative z-10">
                        {loadingMore ? 'Loading...' : 'Load More Tools'}
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