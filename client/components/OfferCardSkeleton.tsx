import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OfferCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="w-full h-40" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title and Budget */}
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-6 w-20" />
        </div>

        {/* Description */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />

        {/* Stack tags */}
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>

        {/* Creator info */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        {/* Date and Status */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </Card>
  );
}

export function OfferGridSkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <OfferCardSkeleton key={i} />
      ))}
    </div>
  );
}
