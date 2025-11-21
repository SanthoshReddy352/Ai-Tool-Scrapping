import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ToolCardSkeleton: React.FC = () => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-0">
        <Skeleton className="w-full h-48 rounded-t-lg bg-muted" />
      </CardHeader>
      
      <CardContent className="flex-grow p-4">
        <Skeleton className="h-6 w-3/4 mb-2 bg-muted" />
        <Skeleton className="h-4 w-full mb-1 bg-muted" />
        <Skeleton className="h-4 w-full mb-1 bg-muted" />
        <Skeleton className="h-4 w-2/3 bg-muted" />
        
        <div className="flex flex-wrap gap-1 mt-3">
          <Skeleton className="h-5 w-16 bg-muted" />
          <Skeleton className="h-5 w-20 bg-muted" />
          <Skeleton className="h-5 w-14 bg-muted" />
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <Skeleton className="h-4 w-full bg-muted" />
        <div className="flex gap-2 w-full">
          <Skeleton className="h-9 flex-1 bg-muted" />
          <Skeleton className="h-9 w-9 bg-muted" />
        </div>
      </CardFooter>
    </Card>
  );
};
