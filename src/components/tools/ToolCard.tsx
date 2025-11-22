import React, { useState } from 'react';
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

// Color gradients based on category
const getCategoryGradient = (category: string) => {
  const gradients: Record<string, string> = {
    'Content Creation': 'from-purple-500 via-pink-500 to-rose-500',
    'Image Generation': 'from-cyan-500 via-blue-500 to-indigo-500',
    'Code Assistant': 'from-emerald-500 via-teal-500 to-cyan-500',
    'Video Editing': 'from-orange-500 via-red-500 to-pink-500',
    'Data Analysis': 'from-blue-500 via-indigo-500 to-purple-500',
    'Marketing': 'from-yellow-500 via-orange-500 to-red-500',
    'Productivity': 'from-green-500 via-emerald-500 to-teal-500',
    'Design': 'from-fuchsia-500 via-purple-500 to-pink-500',
    'Research': 'from-indigo-500 via-purple-500 to-pink-500',
    'Audio': 'from-violet-500 via-fuchsia-500 to-pink-500',
    'default': 'from-blue-500 via-purple-500 to-pink-500'
  };
  return gradients[category] || gradients.default;
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const [isHovered, setIsHovered] = useState(false);
  const gradient = getCategoryGradient(tool.category);

  return (
    <Link 
      to={`/tool/${tool.id}`}
      className="block w-full outline-none"
      data-testid={`tool-card-${tool.id}`}
    >
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ 
          y: -8,
          scale: 1.02,
          transition: { duration: 0.3, ease: 'easeOut' }
        }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative group"
        style={{ aspectRatio: '1 / 1' }}
      >
        {/* Main Card Container - Square */}
        <div className={cn(
          "relative w-full h-full overflow-hidden rounded-3xl",
          "transition-all duration-500 ease-out",
          "shadow-xl hover:shadow-2xl"
        )}>
          
          {/* Animated Gradient Mesh Background */}
          <motion.div 
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              gradient,
              "opacity-90"
            )}
            animate={isHovered ? {
              scale: [1, 1.1, 1.05],
              rotate: [0, 2, 0],
            } : {}}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
          
          {/* Animated mesh pattern overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                               radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                               radial-gradient(circle at 40% 20%, rgba(0,0,0,0.1) 0%, transparent 40%)`,
            }}
            animate={isHovered ? {
              opacity: [0.5, 1, 0.7],
            } : {
              opacity: 0.5
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Glassmorphism Content Container */}
          <div className="absolute inset-0 p-6 flex flex-col backdrop-blur-[2px]">
            
            {/* Top Section: Category Badge */}
            <div className="flex justify-end items-start mb-4 relative z-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                whileHover={{ scale: 1.1, rotate: 3 }}
              >
                <Badge 
                  className={cn(
                    "text-xs font-bold px-4 py-1.5 uppercase tracking-widest",
                    "bg-white/20 backdrop-blur-md text-white border-2 border-white/40",
                    "shadow-lg hover:bg-white/30 transition-all duration-300"
                  )}
                >
                  {tool.category}
                </Badge>
              </motion.div>
            </div>

            {/* Middle Section: Glass Panel with Title & Description */}
            <motion.div 
              className={cn(
                "relative rounded-2xl p-5 mb-4 flex-grow",
                "bg-white/10 backdrop-blur-xl border border-white/20",
                "shadow-2xl transition-all duration-500"
              )}
              animate={isHovered ? {
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderColor: "rgba(255, 255, 255, 0.3)",
              } : {}}
            >
              {/* Tool Name */}
              <motion.h3 
                className="text-2xl font-black text-white mb-3 leading-tight line-clamp-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {tool.name}
              </motion.h3>
              
              {/* Description */}
              <motion.p 
                className="text-sm text-white/90 leading-relaxed line-clamp-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                {tool.description || 'No description available for this tool.'}
              </motion.p>
            </motion.div>

            {/* Bottom Section: Tags & Buttons */}
            <motion.div 
              className={cn(
                "relative rounded-2xl p-4",
                "bg-white/10 backdrop-blur-xl border border-white/20",
                "shadow-2xl transition-all duration-500"
              )}
              animate={isHovered ? {
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderColor: "rgba(255, 255, 255, 0.3)",
              } : {}}
            >
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4 min-h-[28px]">
                {tool.tags && tool.tags.length > 0 ? (
                  tool.tags.slice(0, 3).map((tag, index) => (
                    <motion.span 
                      key={tag} 
                      className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full",
                        "text-xs font-semibold bg-white/20 text-white",
                        "border border-white/30 backdrop-blur-sm",
                        "hover:bg-white/30 transition-all duration-300"
                      )}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.1, y: -2 }}
                    >
                      #{tag}
                    </motion.span>
                  ))
                ) : (
                  <motion.span 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    <Sparkles className="h-3 w-3" /> AI Tool
                  </motion.span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 items-center">
                {/* Primary View Button */}
                <motion.div 
                  className="flex-1"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    variant="default" 
                    className={cn(
                      "w-full h-11 font-bold text-sm",
                      "bg-white/90 hover:bg-white text-gray-900",
                      "shadow-lg hover:shadow-xl transition-all duration-300"
                    )}
                    size="sm"
                    data-testid={`view-details-${tool.id}`}
                  >
                    <span className="flex items-center gap-2">
                      View Details
                      <ArrowUpRight className="h-4 w-4" />
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
                    className={cn(
                      "h-11 w-11 shrink-0 rounded-xl",
                      "bg-white/20 backdrop-blur-md border-2 border-white/40",
                      "hover:bg-white/30 text-white",
                      "shadow-lg hover:shadow-xl transition-all duration-300"
                    )}
                    data-testid={`external-link-${tool.id}`}
                  >
                    <a 
                      href={tool.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Visit Website"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </Button>
                </motion.div>
              </div>
            </motion.div>

          </div>

          {/* Glow effect on hover */}
          <motion.div
            className={cn(
              "absolute -inset-1 rounded-3xl blur-xl -z-10 opacity-0",
              "bg-gradient-to-br",
              gradient
            )}
            animate={{ 
              opacity: isHovered ? 0.6 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </Link>
  );
};
