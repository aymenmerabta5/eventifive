import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  MessageSquare,
  Star,
  AlertTriangle,
  Lock,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_RATING, MIN_RATING, MAX_RATING } from "../constants";
import type { ReviewRecommendation } from "../types";

interface ReviewFormCardProps {
  rating: number | null;
  comments: string;
  isReadOnly: boolean;
  isSubmitting: boolean;
  recommendationToShow: ReviewRecommendation | undefined;
  submittedAt: string | null;
  reviewErrorMessage: string | null;
  onRatingChange: (value: number) => void;
  onCommentsChange: (value: string) => void;
  onSubmit: () => void;
}

export function ReviewFormCard({
  rating,
  comments,
  isReadOnly,
  isSubmitting,
  recommendationToShow,
  submittedAt,
  reviewErrorMessage,
  onRatingChange,
  onCommentsChange,
  onSubmit,
}: ReviewFormCardProps) {
  const displayRating = rating ?? DEFAULT_RATING;
  const canSubmit =
    !isReadOnly && rating !== null && recommendationToShow !== undefined;

  // Rating labels for visual feedback
  const ratingLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
  const currentLabel = ratingLabels[displayRating - 1] || "Select rating";

  return (
    <Card className="border-border/60 bg-card/80 relative overflow-hidden backdrop-blur-sm">
      {/* Left accent bar */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1 transition-colors duration-300",
          isReadOnly
            ? "from-primary/60 to-primary/30 bg-gradient-to-b"
            : "from-secondary via-primary to-primary/80 bg-gradient-to-b",
        )}
      />

      <CardHeader className="pl-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="font-display flex items-center gap-2 text-xl tracking-tight">
              <MessageSquare className="text-primary h-5 w-5" />
              Your Review
            </CardTitle>
            <CardDescription>
              {isReadOnly
                ? "This review has been submitted and is read-only"
                : "Rate the submission and provide your feedback"}
            </CardDescription>
          </div>
          {isReadOnly && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 gap-1.5 border"
            >
              <Lock className="h-3 w-3" />
              Locked
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pl-5">
        {/* Read-only notice */}
        {isReadOnly && (
          <div className="bg-primary/5 border-primary/20 flex items-start gap-3 rounded-lg border p-4">
            <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
            <div className="space-y-0.5">
              <p className="text-foreground text-sm font-medium">
                Review submitted successfully
              </p>
              <p className="text-muted-foreground text-xs">
                {submittedAt
                  ? `Submitted on ${submittedAt}`
                  : "This review is view-only and cannot be modified."}
              </p>
            </div>
          </div>
        )}

        {/* Review error notice */}
        {reviewErrorMessage && !isReadOnly && (
          <div className="border-destructive/30 bg-destructive/5 flex items-start gap-3 rounded-lg border p-4">
            <AlertTriangle className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0" />
            <div className="space-y-0.5">
              <p className="text-destructive text-sm font-medium">
                Could not load existing review
              </p>
              <p className="text-destructive/80 text-xs">{reviewErrorMessage}</p>
            </div>
          </div>
        )}

        {/* Rating section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-foreground flex items-center gap-2 text-sm font-medium">
              <Star className="text-primary h-4 w-4" />
              Rating
              <span className="text-destructive">*</span>
            </Label>
            <Badge
              variant="outline"
              className={cn(
                "transition-colors",
                displayRating >= 4
                  ? "border-primary/30 text-primary"
                  : displayRating >= 3
                    ? "border-secondary text-secondary-foreground"
                    : "border-destructive/30 text-destructive",
              )}
            >
              {displayRating} / 5 — {currentLabel}
            </Badge>
          </div>

          <p className="text-muted-foreground text-sm">
            {isReadOnly
              ? "This rating was submitted and cannot be changed."
              : "Rate from 1 (reject) to 5 (accept). Ratings above 2.5 auto-recommend acceptance."}
          </p>

          {/* Custom rating slider with visual enhancement */}
          <div className="bg-muted/30 border-border/50 space-y-4 rounded-xl border p-4">
            <Slider
              min={MIN_RATING}
              max={MAX_RATING}
              step={1}
              value={[displayRating]}
              onValueChange={(values: number[]) =>
                onRatingChange(values[0] ?? DEFAULT_RATING)
              }
              disabled={isReadOnly}
              className="w-full"
            />

            {/* Rating scale labels */}
            <div className="text-muted-foreground flex items-center justify-between text-xs font-medium">
              <span className="flex flex-col items-center gap-1">
                <XCircle className="text-destructive/60 h-4 w-4" />
                <span>Reject</span>
              </span>
              <span className="flex flex-col items-center gap-1 opacity-60">
                <span className="bg-border h-2 w-px" />
                <span>Neutral</span>
              </span>
              <span className="flex flex-col items-center gap-1">
                <CheckCircle2 className="text-primary/60 h-4 w-4" />
                <span>Accept</span>
              </span>
            </div>
          </div>
        </div>

        {/* Auto recommendation display */}
        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors",
            recommendationToShow === "accept"
              ? "border-primary/30 bg-primary/5"
              : recommendationToShow === "reject"
                ? "border-destructive/30 bg-destructive/5"
                : "border-border/50 bg-muted/30",
          )}
        >
          <div className="space-y-0.5">
            <p className="text-foreground text-sm font-medium">
              {isReadOnly ? "Final Recommendation" : "Auto Recommendation"}
            </p>
            <p className="text-muted-foreground text-xs">
              {isReadOnly
                ? "This was the submitted recommendation."
                : "Based on your rating, calculated automatically."}
            </p>
          </div>

          {recommendationToShow ? (
            <Badge
              variant={
                recommendationToShow === "accept" ? "default" : "destructive"
              }
              className="gap-1.5 px-3 py-1.5"
            >
              {recommendationToShow === "accept" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              {recommendationToShow === "accept" ? "Accept" : "Reject"}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-muted-foreground">
              {isReadOnly ? "No recommendation" : "Set a rating first"}
            </Badge>
          )}
        </div>

        <Separator />

        {/* Comments section */}
        <div className="space-y-3">
          <Label
            htmlFor="comments"
            className="text-foreground flex items-center gap-2 text-sm font-medium"
          >
            <MessageSquare className="text-muted-foreground h-4 w-4" />
            Comments
            <span className="text-muted-foreground text-xs font-normal">
              (optional)
            </span>
          </Label>
          <Textarea
            id="comments"
            placeholder="Share your overall thoughts, suggestions, or concerns about this submission..."
            value={comments}
            onChange={(e) => onCommentsChange(e.target.value)}
            rows={5}
            className={cn(
              "bg-background/50 resize-none transition-colors",
              "focus:border-primary/50 focus:ring-primary/20",
              isReadOnly && "cursor-not-allowed opacity-60",
            )}
            disabled={isReadOnly}
          />
          <p className="text-muted-foreground text-xs">
            Provide any additional feedback that may help with the review
            decision.
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-4 border-t pl-5 pt-6 sm:flex-row sm:justify-between">
        <p className="text-muted-foreground text-xs">
          {isReadOnly
            ? "This review is complete and cannot be modified."
            : "Review all files above before submitting. This action cannot be undone."}
        </p>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !canSubmit}
          className={cn(
            "w-full gap-2 font-medium transition-all sm:w-auto sm:min-w-[180px]",
            canSubmit && !isSubmitting && "shadow-lg shadow-primary/20",
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : isReadOnly ? (
            <>
              <Lock className="h-4 w-4" />
              Review Locked
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Review
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
