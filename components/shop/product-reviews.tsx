'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Star, ThumbsUp, MessageCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductReview } from '@/types/woocommerce';

interface ProductReviewsProps {
  productId: number;
  reviews: ProductReview[];
  averageRating: string;
  ratingCount: number;
  onSubmitReview?: (review: ReviewFormData) => Promise<void>;
  className?: string;
  compact?: boolean;
}

export interface ReviewFormData {
  rating: number;
  reviewer: string;
  reviewer_email: string;
  review: string;
}

export function ProductReviews({
  productId,
  reviews,
  averageRating,
  ratingCount,
  onSubmitReview,
  className,
  compact = false,
}: ProductReviewsProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    stars: star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: ratingCount > 0 ? (reviews.filter((r) => r.rating === star).length / ratingCount) * 100 : 0,
  }));

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.date_created).getTime() - new Date(a.date_created).getTime();
    } else if (sortBy === 'highest') {
      return b.rating - a.rating;
    } else {
      return a.rating - b.rating;
    }
  });

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!onSubmitReview) return;

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const reviewData: ReviewFormData = {
      rating: parseInt(formData.get('rating') as string, 10),
      reviewer: formData.get('reviewer') as string,
      reviewer_email: formData.get('reviewer_email') as string,
      review: formData.get('review') as string,
    };

    try {
      await onSubmitReview(reviewData);
      setShowReviewForm(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Reviews Summary - Hide in compact mode */}
      {!compact && (
        <div className="rounded-lg border bg-muted/50 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Overall Rating */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{averageRating}</span>
                <span className="text-2xl text-muted-foreground">/ 5</span>
              </div>
              <StarRating rating={parseFloat(averageRating)} size="lg" />
              <p className="text-sm text-muted-foreground">
                Based on {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-2 text-sm">
                  <span className="w-12 text-right">{stars} star</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Compact mode: Simple rating display */}
      {compact && ratingCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StarRating rating={parseFloat(averageRating)} size="md" />
            <span className="text-sm font-medium">{averageRating}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      )}

      {/* Review Actions */}
      {!compact && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">Sort by:</Label>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="highest">Highest rated</SelectItem>
                <SelectItem value="lowest">Lowest rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => setShowReviewForm(!showReviewForm)}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Write a Review
          </Button>
        </div>
      )}

      {/* Compact mode: Write review button */}
      {compact && (
        <Button
          onClick={() => setShowReviewForm(!showReviewForm)}
          variant="outline"
          className="w-full"
          size="sm"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          {showReviewForm ? 'Cancel' : 'Write a Review'}
        </Button>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="rounded-lg border bg-background p-6">
          <h3 className="mb-4 text-lg font-semibold">Write Your Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Your Rating *</Label>
              <StarRatingInput name="rating" required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reviewer">Your Name *</Label>
                <Input
                  id="reviewer"
                  name="reviewer"
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewer_email">Your Email *</Label>
                <Input
                  id="reviewer_email"
                  name="reviewer_email"
                  type="email"
                  required
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review">Your Review *</Label>
              <Textarea
                id="review"
                name="review"
                required
                placeholder="Tell us what you think about this product..."
                rows={5}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className={cn(
            "rounded-lg border bg-muted/50 text-center",
            compact ? "p-4" : "p-8"
          )}>
            {!compact && <MessageCircle className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />}
            <p className={cn("font-medium", compact ? "text-sm" : "text-lg")}>No reviews yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Be the first to review this product
            </p>
          </div>
        ) : (
          (compact ? sortedReviews.slice(0, 3) : sortedReviews).map((review) => (
            <ReviewCard key={review.id} review={review} compact={compact} />
          ))
        )}
      </div>
    </div>
  );
}

// Star Rating Display Component
function StarRating({
  rating,
  size = 'md',
  showCount = false,
  count = 0,
}: {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
}) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            sizeClasses[size],
            i < Math.floor(rating) ? 'text-yellow-400' : 'text-muted-foreground'
          )}
        >
          ★
        </span>
      ))}
      {showCount && count > 0 && (
        <span className="ml-1 text-sm text-muted-foreground">({count})</span>
      )}
    </div>
  );
}

// Star Rating Input Component
function StarRatingInput({ name, required }: { name: string; required?: boolean }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={rating} required={required} />
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            type="button"
            onClick={() => setRating(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
            className="transition-colors hover:scale-110"
          >
            <span
              className={cn(
                'text-3xl',
                starValue <= (hover || rating)
                  ? 'text-yellow-400'
                  : 'text-muted-foreground'
              )}
            >
              ★
            </span>
          </button>
        );
      })}
      {rating > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">
          {rating} {rating === 1 ? 'star' : 'stars'}
        </span>
      )}
    </div>
  );
}

// Individual Review Card
function ReviewCard({ review, compact = false }: { review: ProductReview; compact?: boolean }) {
  const [helpful, setHelpful] = useState(false);

  return (
    <div className={cn("rounded-lg border bg-background", compact ? "p-4" : "p-6")}>
      <div className="mb-3 flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className={cn("font-semibold", compact && "text-sm")}>{review.reviewer}</p>
            {review.verified && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <CheckCircle2 className="h-3 w-3" />
                Verified Purchase
              </Badge>
            )}
          </div>
          <StarRating rating={review.rating} size="sm" />
        </div>
        <time className="text-xs text-muted-foreground">
          {new Date(review.date_created).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: compact ? undefined : 'numeric',
          })}
        </time>
      </div>

      <div
        className={cn("prose max-w-none dark:prose-invert", compact ? "prose-sm text-sm" : "prose-sm")}
        dangerouslySetInnerHTML={{ __html: review.review }}
      />

      {/* Review Actions - Hide in compact mode */}
      {!compact && (
        <div className="mt-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHelpful(!helpful)}
            className={cn(
              'gap-2',
              helpful && 'text-primary'
            )}
          >
            <ThumbsUp className="h-4 w-4" />
            Helpful
          </Button>
        </div>
      )}
    </div>
  );
}
