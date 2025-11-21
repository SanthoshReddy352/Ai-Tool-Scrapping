import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolCard } from '@/components/tools/ToolCard';
import { ToolCardSkeleton } from '@/components/tools/ToolCardSkeleton';
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

  // UPDATED: Added pageIndex parameter to prevent duplicate fetching
  const performSearch = async (reset = false, pageIndex?: number) => {
    // Use the passed pageIndex if available, otherwise fall back to state
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

  // UPDATED: Calculate next page and pass it explicitly
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
      <section className="bg-gradient-to-b from-primary/10 to-background py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
            Search AI Tools
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-center mb-8">
            Find the perfect AI tool for your needs using our advanced search and filtering options.
          </p>

          <div className="max-w-3xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[250px]">
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

              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full md:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>

            {allTags.length > 0 && (
              <div>
                <div className="text-sm font-medium text-foreground mb-2">Filter by Tags:</div>
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 20).map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/80 transition-colors"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {loading && tools.length === 0 ? 'Searching...' : `${tools.length} Results`}
          </h2>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-sm text-muted-foreground">Active tags:</span>
              {selectedTags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {loading && tools.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ToolCardSkeleton key={i} />
            ))}
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No tools found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or filters
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-12">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  size="lg"
                  variant="outline"
                >
                  {loading ? 'Loading...' : 'Load More Results'}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default SearchPage;