import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ToolCardSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="flex flex-col aspect-square overflow-hidden rounded-xl border-border/60 relative">
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Header Skeleton */}
        <CardHeader className="p-5 pb-2 space-y-0 flex-shrink-0 relative z-10">
          <div className="flex justify-between items-start gap-3">
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </CardHeader>
        
        {/* Content Skeleton */}
        <CardContent className="flex-grow p-5 pt-3 flex flex-col min-h-0 relative z-10">
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
          
          <div className="mt-auto flex gap-1.5">
            <Skeleton className="h-5 w-12 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
        </CardContent>
        
        {/* Footer Skeleton */}
        <CardFooter className="p-4 pt-0 flex flex-col gap-3 mt-auto flex-shrink-0 relative z-10">
          <div className="w-full h-px bg-muted" />
          <div className="flex gap-3 w-full">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};