import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AITool } from '@/types/types';

interface ToolCardProps {
  tool: AITool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  return (
    <Link 
      to={`/tool/${tool.id}`}
      className="block h-full w-full outline-none"
    >
      <motion.div
        whileHover={{ 
          y: -8,
          transition: { duration: 0.3, ease: 'easeOut' }
        }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className={cn(
          "group relative flex flex-col aspect-square overflow-hidden rounded-xl border-border/60 bg-gradient-to-br from-card to-card/50",
          "transition-all duration-300 ease-out",
          "hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50",
          "focus-visible:ring-2 focus-visible:ring-primary"
        )}>
          
          {/* Decorative Gradient Overlay on Hover */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" 
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Animated shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />

        {/* HEADER: Title & Badge */}
        <CardHeader className="p-5 pb-2 space-y-0 flex-shrink-0 relative z-10">
          <div className="flex justify-between items-start gap-3">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <CardTitle className="text-lg font-bold leading-tight tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
                {tool.name}
              </CardTitle>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              whileHover={{ scale: 1.1, rotate: 3 }}
            >
              <Badge 
                variant="secondary" 
                className="shrink-0 text-[10px] uppercase tracking-wider font-semibold h-6 px-2 bg-secondary/50 text-secondary-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors"
              >
                {tool.category}
              </Badge>
            </motion.div>
          </div>
        </CardHeader>
        
        {/* CONTENT: Description (Shrinks if needed) & Tags */}
        <CardContent className="flex-grow p-5 pt-3 flex flex-col min-h-0 relative z-10">
          {/* Description with smart clamping */}
          <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-3 mb-4 group-hover:text-muted-foreground transition-colors">
            {tool.description || 'No description available for this tool.'}
          </p>
          
          {/* Tags - Pushed to bottom of content area */}
          <div className="mt-auto flex flex-wrap gap-1.5 content-end">
            {tool.tags && tool.tags.length > 0 ? (
              tool.tags.slice(0, 3).map((tag, index) => (
                <motion.span 
                  key={tag} 
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/5 text-primary/70 border border-primary/10 group-hover:bg-primary/10 transition-colors"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.1 }}
                >
                  #{tag}
                </motion.span>
              ))
            ) : (
              <motion.span 
                className="text-[10px] text-muted-foreground italic flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <Sparkles className="h-3 w-3" /> AI Tool
              </motion.span>
            )}
          </div>
        </CardContent>
        
        {/* FOOTER: Always Visible Action Bar */}
        <CardFooter className="p-4 pt-0 flex flex-col gap-3 mt-auto flex-shrink-0 relative z-10">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" /> 
          
          <div className="flex gap-3 w-full items-center">
            {/* Primary "View" Button (Visual only, since whole card is link) */}
            <Button 
              variant="default" 
              className="flex-1 h-9 shadow-sm bg-primary/90 hover:bg-primary group-hover:translate-x-1 transition-all duration-300"
              size="sm"
            >
              View Details
              <ArrowUpRight className="h-3.5 w-3.5 ml-2 opacity-70" />
            </Button>

            {/* External Link Button (Separate click handler) */}
            <Button 
              asChild 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 shrink-0 rounded-lg border border-input bg-transparent hover:bg-accent hover:text-accent-foreground z-20"
            >
              <a 
                href={tool.url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Visit Website"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};