import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export const ToolCardSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full"
      style={{ aspectRatio: '1 / 1' }}
    >
      <div className="relative w-full h-full overflow-hidden rounded-3xl bg-gradient-to-br from-muted/50 to-muted shadow-xl">
        {/* Animated shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        <div className="absolute inset-0 p-6 flex flex-col">
          {/* Top Section: Badge */}
          <div className="flex justify-end items-start mb-4 relative z-10">
            <Skeleton className="h-7 w-24 rounded-full bg-muted-foreground/20" />
          </div>

          {/* Middle Section: Glass Panel */}
          <div className="relative rounded-2xl p-5 mb-4 flex-grow bg-muted-foreground/10 backdrop-blur-sm">
            {/* Title */}
            <Skeleton className="h-7 w-3/4 mb-3 rounded-md bg-muted-foreground/30" />
            <Skeleton className="h-7 w-1/2 mb-4 rounded-md bg-muted-foreground/30" />
            
            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded bg-muted-foreground/20" />
              <Skeleton className="h-4 w-[95%] rounded bg-muted-foreground/20" />
              <Skeleton className="h-4 w-[70%] rounded bg-muted-foreground/20" />
            </div>
          </div>

          {/* Bottom Section: Tags & Buttons */}
          <div className="relative rounded-2xl p-4 bg-muted-foreground/10 backdrop-blur-sm">
            {/* Tags */}
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-6 w-16 rounded-full bg-muted-foreground/20" />
              <Skeleton className="h-6 w-20 rounded-full bg-muted-foreground/20" />
              <Skeleton className="h-6 w-14 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Skeleton className="h-11 flex-1 rounded-xl bg-muted-foreground/30" />
              <Skeleton className="h-11 w-11 rounded-xl bg-muted-foreground/30" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};