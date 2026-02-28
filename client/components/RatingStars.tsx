import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  totalReviews?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function RatingStars({
  rating,
  totalReviews,
  size = "md",
  interactive = false,
  onRatingChange,
  className,
}: RatingStarsProps) {
  const sizeMap = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex gap-0.5">
        {stars.map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRatingChange?.(star)}
            disabled={!interactive}
            className={cn(
              "transition-colors",
              interactive && "cursor-pointer hover:opacity-80"
            )}
          >
            <Star
              className={cn(
                sizeMap[size],
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-white/30"
              )}
            />
          </button>
        ))}
      </div>

      {totalReviews !== undefined && (
        <div className="ml-2 text-xs text-white/60">
          {rating.toFixed(1)} ({totalReviews})
        </div>
      )}
    </div>
  );
}
