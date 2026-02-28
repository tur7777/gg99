import { useReviewsByAddress } from "@/hooks/api";
import { RatingStars } from "./RatingStars";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewListProps {
  address: string;
}

export function ReviewList({ address }: ReviewListProps) {
  const { data: reviewsData, isLoading } = useReviewsByAddress(address);
  const reviews = reviewsData?.items || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center text-white/60 text-sm">
        No reviews yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-lg border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-start justify-between mb-2">
            <RatingStars rating={review.rating} size="sm" />
            <span className="text-xs text-white/50">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          {review.comment && (
            <p className="text-sm text-white/80">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}
