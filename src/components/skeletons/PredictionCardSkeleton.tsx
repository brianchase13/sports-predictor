import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PredictionCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Matchup */}
        <div className="flex items-center justify-center gap-6 py-2">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-6 w-4" />
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-10" />
          </div>
        </div>

        {/* Prediction summary */}
        <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-muted/50">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-10" />
        </div>

        {/* Collapsible triggers */}
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

export function PredictionCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PredictionCardSkeleton key={i} />
      ))}
    </>
  );
}
