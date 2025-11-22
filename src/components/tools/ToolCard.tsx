import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AITool } from '@/types/types';

interface ToolCardProps {
  tool: AITool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  // Removed useState and getCategoryGradient to improve performance and unify the theme

  return (
    <Link 
      to={`/tool/${tool.id}`}
      className="block w-full outline-none group"
      data-testid={`tool-card-${tool.id}`}
    >
      <motion.div
        whileHover={{ 
          y: -5,
          scale: 1.01,
          transition: { duration: 0.2, ease: 'easeOut' }
        }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative"
        style={{ aspectRatio: '1 / 1' }}
      >
        {/* Main Card Container - Square */}
        <div className={cn(
          "relative w-full h-full overflow-hidden rounded-3xl",
          "transition-all duration-300 ease-out",
          "shadow-lg hover:shadow-xl",
          "bg-card border border-border", // Standard theme card background
          "group-hover:border-primary/50" // Subtle border highlight on hover
        )}>
          
          {/* Theme Gradient Background - Consistent Primary Color */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent",
            "opacity-100 transition-opacity duration-500",
            "group-hover:opacity-80"
          )} />
          
          {/* CSS-Only Mesh Pattern (No JS Render Cycle) */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700"
            style={{
              backgroundImage: `radial-gradient(circle at 80% 80%, hsl(var(--primary)) 0%, transparent 50%)`,
            }}
          />

          {/* Content Container */}
          <div className="absolute inset-0 p-6 flex flex-col">
            
            {/* Top Section: Category Badge */}
            <div className="flex justify-end items-start mb-4 relative z-20">
              <div className="transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-2">
                <Badge 
                  className={cn(
                    "text-xs font-bold px-4 py-1.5 uppercase tracking-widest",
                    "bg-primary/10 text-primary border border-primary/20",
                    "backdrop-blur-md shadow-sm"
                  )}
                >
                  {tool.category}
                </Badge>
              </div>
            </div>

            {/* Middle Section: Title & Description */}
            <div className="relative mb-4 flex-grow">
              {/* Tool Name */}
              <h3 className="text-2xl font-black text-foreground mb-3 leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
                {tool.name}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {tool.description || 'No description available for this tool.'}
              </p>
            </div>

            {/* Bottom Section: Tags & Buttons */}
            <div className="relative mt-auto">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4 min-h-[28px]">
                {tool.tags && tool.tags.length > 0 ? (
                  tool.tags.slice(0, 3).map((tag) => (
                    <span 
                      key={tag} 
                      className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full",
                        "text-xs font-semibold bg-secondary text-secondary-foreground",
                        "border border-border transition-colors duration-300",
                        "group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20"
                      )}
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
                    <Sparkles className="h-3 w-3" /> AI Tool
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 items-center pt-4 border-t border-border/50">
                {/* Primary View Button */}
                <div className="flex-1">
                  <Button 
                    variant="default" 
                    className="w-full font-bold text-sm shadow-sm group-hover:shadow-md transition-all"
                    size="sm"
                  >
                    <span className="flex items-center gap-2">
                      View Details
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </Button>
                </div>

                {/* External Link Button */}
                <div>
                  <Button 
                    asChild 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a 
                      href={tool.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="Visit Website"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Glow effect on hover - CSS based */}
          <div
            className={cn(
              "absolute -inset-1 rounded-3xl blur-xl -z-10",
              "bg-primary/20",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            )}
          />
        </div>
      </motion.div>
    </Link>
  );
};