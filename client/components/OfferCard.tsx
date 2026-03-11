import { Offer } from "@shared/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "./RatingStars";
import { cn } from "@/lib/utils";

interface OfferCardProps {
  offer: Offer;
  creatorName?: string;
  creatorRating?: number;
  creatorReviews?: number;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}

const STACK_COLORS: Record<string, string> = {
  react: "bg-blue-500/20 text-blue-300",
  typescript: "bg-blue-400/20 text-blue-200",
  "node.js": "bg-green-500/20 text-green-300",
  nodejs: "bg-green-500/20 text-green-300",
  web3: "bg-purple-500/20 text-purple-300",
  solidity: "bg-red-500/20 text-red-300",
  python: "bg-yellow-500/20 text-yellow-300",
  javascript: "bg-yellow-500/20 text-yellow-300",
  rust: "bg-orange-500/20 text-orange-300",
  go: "bg-cyan-500/20 text-cyan-300",
  default: "bg-gray-500/20 text-gray-300",
};

function getStackColor(stack: string): string {
  const key = stack.toLowerCase();
  return STACK_COLORS[key] || STACK_COLORS.default;
}

export function OfferCard({
  offer,
  creatorName,
  creatorRating = 0,
  creatorReviews = 0,
  onClick,
  className,
  compact = false,
}: OfferCardProps) {
  const stack = Array.isArray(offer.stack) ? offer.stack : [];

  if (compact) {
    return (
      <Card
        className={cn(
          "cursor-pointer p-3 hover:bg-white/10 transition-colors",
          className
        )}
        onClick={onClick}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white line-clamp-2">
              {offer.title}
            </h3>
            <span className="text-lg font-bold text-primary flex-shrink-0">
              {offer.budgetTON}
            </span>
          </div>

          {stack.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {stack.slice(0, 3).map((s) => (
                <Badge
                  key={s}
                  className={cn("text-xs", getStackColor(s))}
                  variant="secondary"
                >
                  {s}
                </Badge>
              ))}
              {stack.length > 3 && (
                <Badge className="text-xs" variant="outline">
                  +{stack.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="text-xs text-white/60">
            {new Date(offer.createdAt).toLocaleDateString()}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "cursor-pointer overflow-hidden hover:shadow-lg transition-all hover:border-primary/50",
        className
      )}
      onClick={onClick}
    >
      {/* Image section */}
      <div className="h-40 bg-gradient-to-br from-white/10 to-white/5 overflow-hidden">
        {offer.imageUrl ? (
          <img
            src={offer.imageUrl}
            alt={offer.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white/20">No image</div>
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="p-4 space-y-3">
        {/* Title and Budget */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white line-clamp-2 flex-1">
            {offer.title}
          </h3>
          <div className="flex-shrink-0 text-right">
            <div className="text-xl font-bold text-primary">{offer.budgetTON}</div>
            <div className="text-xs text-white/60">TON</div>
          </div>
        </div>

        {/* Description */}
        {offer.description && (
          <p className="text-sm text-white/70 line-clamp-2">
            {offer.description}
          </p>
        )}

        {/* Stack tags */}
        {stack.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {stack.map((s) => (
              <Badge
                key={s}
                className={cn("text-xs", getStackColor(s))}
                variant="secondary"
              >
                {s}
              </Badge>
            ))}
          </div>
        )}

        {/* Creator info */}
        {creatorName && (
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Posted by</p>
                <p className="text-sm font-medium text-white">{creatorName}</p>
              </div>
              {creatorRating > 0 && (
                <RatingStars
                  rating={creatorRating}
                  totalReviews={creatorReviews}
                  size="sm"
                />
              )}
            </div>
          </div>
        )}

        {/* Date */}
        <div className="text-xs text-white/50 flex items-center justify-between pt-2 border-t border-white/10">
          <span>{new Date(offer.createdAt).toLocaleDateString()}</span>
          <span
            className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              offer.status === "open"
                ? "bg-green-500/20 text-green-300"
                : "bg-yellow-500/20 text-yellow-300"
            )}
          >
            {offer.status}
          </span>
        </div>
      </div>
    </Card>
  );
}
