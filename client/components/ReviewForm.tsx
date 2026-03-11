import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReview } from "@/hooks/api";
import { useToast } from "@/hooks/use-toast";
import { RatingStars } from "./RatingStars";

interface ReviewFormProps {
  orderId: string;
  revieweeAddress: string;
  onSuccess?: () => void;
}

export function ReviewForm({
  orderId,
  revieweeAddress,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const createReview = useCreateReview();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview.mutateAsync({
        orderId,
        rating,
        comment: comment || undefined,
        revieweeAddress,
      });

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      setRating(0);
      setComment("");
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Failed to submit review",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Rating
        </label>
        <RatingStars
          rating={rating}
          size="lg"
          interactive
          onRatingChange={setRating}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Comment (optional)
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience working with this user..."
          className="min-h-24 resize-none"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
}
