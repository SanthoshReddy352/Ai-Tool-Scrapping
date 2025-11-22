import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolCard } from '@/components/tools/ToolCard';
import { ToolCardSkeleton } from '@/components/tools/ToolCardSkeleton';
import { FadeInWhenVisible } from '@/components/animations/FadeInWhenVisible';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';
import { toolsApi } from '@/db/api';
import type { AITool, Category } from '@/types/types';
import { useDebounce } from '@/hooks/use-debounce';

const SearchPage: React.FC = () => {
  const [tools, setTools] = useState<AITool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    performSearch(true);
  }, [debouncedSearch, selectedCategory, selectedTags]);

  const loadInitialData = async () => {
    const [categoriesData, tagsData] = await Promise.all([
      toolsApi.getCategories(),
      toolsApi.getAllTags(),
    ]);
    setCategories(categoriesData);
    setAllTags(tagsData);
  };

  const performSearch = async (reset = false, pageIndex?: number) => {
    const currentPage = reset ? 0 : (pageIndex ?? page);
    
    setLoading(true);
    
    if (reset) {
      setTools([]);
      setPage(0);
    }

    const filters = {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: debouncedSearch || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    };

    const data = await toolsApi.getTools(currentPage, filters);
    
    if (reset) {
      setTools(data);
    } else {
      setTools(prev => [...prev, ...data]);
    }
    
    setHasMore(data.length === 12);
    setLoading(false);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(false, nextPage);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTags([]);
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedTags.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-br from-accent/10 via-primary/5 to-background py-20 px-4 overflow-hidden">
        {/* Animated background */}
        <motion.div
          className="absolute top-10 left-20 w-96 h-96 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
            x: [0, 40, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 right-20 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeInWhenVisible direction="down" duration={0.6}>
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center justify-center gap-2 mb-6"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="p-3 bg-gradient-to-br from-accent to-primary rounded-2xl">
                  <Search className="h-10 w-10 text-white" />
                </div>
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="gradient-text">Advanced Search</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Find the perfect AI tool for your needs using our powerful search and filtering options.
              </p>
            </div>
          </FadeInWhenVisible>

          <FadeInWhenVisible delay={0.3} direction="up" duration={0.6}>
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Search Bar */}
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, description, or features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 text-base border-2 border-border/50 focus:border-primary shadow-lg glass"
                  data-testid="search-input"
                />
              </motion.div>

              {/* Filters Row */}
              <div className="flex flex-col md:flex-row gap-4">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1"
                >
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full h-12 border-2 glass" data-testid="category-filter">
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

                <AnimatePresence>
                  {hasActiveFilters && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="outline" 
                        onClick={clearFilters}
                        className="w-full md:w-auto h-12 border-2"
                        data-testid="clear-filters-btn"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Clear Filters
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div className="glass p-6 rounded-2xl border-2 border-border/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Filter by Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 20).map((tag, index) => (
                      <motion.div
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02, duration: 0.2 }}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Badge
                          variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                          className="cursor-pointer hover:bg-primary/90 transition-all text-sm py-1.5 px-3"
                          onClick={() => toggleTag(tag)}
                          data-testid={`tag-${tag}`}
                        >
                          {tag}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <FadeInWhenVisible direction="up" duration={0.5}>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-foreground">
                {loading && tools.length === 0 ? 'Searching...' : `${tools.length} Results`}
              </h2>
            </div>
            <AnimatePresence>
              {selectedTags.length > 0 && (
                <motion.div 
                  className="flex flex-wrap gap-2 items-center"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
                  {selectedTags.map((tag, index) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge 
                        variant="default"
                        className="cursor-pointer gap-1 py-1.5 px-3"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                        <X className="h-3 w-3" />
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FadeInWhenVisible>

        {loading && tools.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
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
              <p className="text-muted-foreground text-lg mb-6">
                Try adjusting your search terms or filters
              </p>
              {hasActiveFilters && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button onClick={clearFilters} size="lg">
                    Clear All Filters
                  </Button>
                </motion.div>
              )}
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
                      disabled={loading}
                      size="lg"
                      variant="outline"
                      className="h-12 px-8 border-2"
                      data-testid="load-more-btn"
                    >
                      {loading ? 'Loading...' : 'Load More Results'}
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

export default SearchPage;
