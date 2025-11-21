import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowUpRight, Sparkles, Star } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AITool } from '@/types/types';

interface ToolCardProps {
  tool: AITool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <Link 
      to={`/tool/${tool.id}`}
      className="block h-full w-full outline-none"
      data-testid={`tool-card-${tool.id}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        whileHover={{ 
          y: -12,
          transition: { duration: 0.3, ease: 'easeOut' }
        }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="h-full"
      >
        <Card className={cn(
          "group relative flex flex-col h-full overflow-hidden rounded-2xl",
          "bg-gradient-to-br from-card via-card to-card/50",
          "border-2 border-border/60 transition-all duration-300 ease-out",
          "hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50",
          "focus-visible:ring-2 focus-visible:ring-primary"
        )}>
          
          {/* Animated Background Gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
          
          {/* Shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ 
              x: isHovered ? '100%' : '-100%',
              opacity: isHovered ? 1 : 0
            }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />

          {/* Glow effect */}
          {isHovered && (
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-lg -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />

          {/* HEADER: Title & Badge */}
          <CardHeader className="p-6 pb-3 space-y-0 flex-shrink-0 relative z-10">
            <div className="flex justify-between items-start gap-3">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex-1"
              >
                <CardTitle className="text-xl font-bold leading-tight tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {tool.name}
                </CardTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                whileHover={{ scale: 1.15, rotate: 5 }}
              >
                <Badge 
                  variant="secondary" 
                  className="shrink-0 text-[10px] uppercase tracking-wider font-semibold h-6 px-3 bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20 group-hover:from-primary/20 group-hover:to-accent/20 transition-all"
                >
                  {tool.category}
                </Badge>
              </motion.div>
            </div>
          </CardHeader>
          
          {/* CONTENT: Description & Tags */}
          <CardContent className="flex-grow p-6 pt-3 flex flex-col min-h-0 relative z-10">
            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4 group-hover:text-foreground/80 transition-colors">
              {tool.description || 'No description available for this tool.'}
            </p>
            
            {/* Tags */}
            <div className="mt-auto flex flex-wrap gap-2 content-end">
              {tool.tags && tool.tags.length > 0 ? (
                tool.tags.slice(0, 3).map((tag, index) => (
                  <motion.span 
                    key={tag} 
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-primary/5 text-primary/80 border border-primary/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                  >
                    #{tag}
                  </motion.span>
                ))
              ) : (
                <motion.span 
                  className="text-[11px] text-muted-foreground italic flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <Sparkles className="h-3 w-3" /> AI Tool
                </motion.span>
              )}
            </div>
          </CardContent>
          
          {/* FOOTER: Action Buttons */}
          <CardFooter className="p-5 pt-0 flex flex-col gap-3 mt-auto flex-shrink-0 relative z-10">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" /> 
            
            <div className="flex gap-3 w-full items-center">
              {/* Primary View Button */}
              <motion.div 
                className="flex-1"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  variant="default" 
                  className="w-full h-10 shadow-md bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary transition-all duration-300 group/btn"
                  size="sm"
                  data-testid={`view-details-${tool.id}`}
                >
                  <span className="flex items-center gap-2">
                    View Details
                    <motion.div
                      animate={{ x: isHovered ? [0, 3, 0] : 0 }}
                      transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0, ease: "easeInOut" }}
                    >
                      <ArrowUpRight className="h-4 w-4 opacity-70 group-hover/btn:opacity-100" />
                    </motion.div>
                  </span>
                </Button>
              </motion.div>

              {/* External Link Button */}
              <motion.div
                whileHover={{ scale: 1.15, rotate: 8 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button 
                  asChild 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 shrink-0 rounded-xl border-2 border-input bg-card/50 hover:bg-accent hover:text-accent-foreground hover:border-accent z-20 backdrop-blur-sm"
                  data-testid={`external-link-${tool.id}`}
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
              </motion.div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
};
