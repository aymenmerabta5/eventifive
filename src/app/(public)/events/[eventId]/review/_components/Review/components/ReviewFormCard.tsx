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
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Comments</CardTitle>
        <CardDescription>
          Provide overall feedback about the submission (optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isReadOnly && (
          <div className="border-border bg-muted/40 rounded-lg border p-3">
            <p className="text-sm font-medium">Review submitted</p>
            <p className="text-muted-foreground text-xs">
              You can view this review but cannot edit it.
              {submittedAt ? ` Submitted on ${submittedAt}.` : ""}
            </p>
          </div>
        )}

        {reviewErrorMessage && !isReadOnly && (
          <div className="border-destructive/30 bg-destructive/10 rounded-lg border p-3">
            <p className="text-destructive text-sm font-medium">
              Could not load your existing review
            </p>
            <p className="text-destructive/80 text-xs">{reviewErrorMessage}</p>
          </div>
        )}

        {/* Rating Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Committee Registration Rating *
          </Label>
          <p className="text-muted-foreground text-sm">
            {isReadOnly
              ? "This rating was submitted and is read-only."
              : "Use the slider from 1 (lowest) to 5 (highest). Ratings above 2.5 automatically map to an Accept recommendation; 2.5 or below map to Reject."}
          </p>
          <div className="border-border/60 bg-muted/30 space-y-2 rounded-lg border px-4 py-3">
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
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>1 (Reject)</span>
              <span>3 (Neutral)</span>
              <span>5 (Accept)</span>
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            Selected rating: {displayRating} / 5
          </p>
        </div>

        {/* Recommendation Display */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isReadOnly
                  ? "Submitted recommendation"
                  : "Auto recommendation"}
              </p>
              <p className="text-muted-foreground text-xs">
                {isReadOnly
                  ? "This review has been submitted and is locked from editing."
                  : "Ratings above 2.5 map to Accept; 2.5 or below map to Reject."}
              </p>
            </div>
            {recommendationToShow ? (
              <div className="flex items-center gap-2">
                {recommendationToShow === "accept" ? (
                  <CheckCircle2 className="text-primary h-4 w-4" />
                ) : (
                  <XCircle className="text-destructive h-4 w-4" />
                )}
                <Badge
                  variant={
                    recommendationToShow === "accept"
                      ? "default"
                      : "destructive"
                  }
                >
                  {recommendationToShow === "accept" ? "Accept" : "Reject"}
                </Badge>
              </div>
            ) : (
              <Badge variant="secondary">
                {isReadOnly ? "No recommendation found" : "Set a rating"}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Comments Section */}
        <div className="space-y-2">
          <Label htmlFor="comments" className="text-sm font-medium">
            Overall Comments
          </Label>
          <Textarea
            id="comments"
            placeholder="Share your overall thoughts, suggestions, or concerns about this submission..."
            value={comments}
            onChange={(e) => onCommentsChange(e.target.value)}
            rows={6}
            className="resize-none"
            disabled={isReadOnly}
          />
          <p className="text-muted-foreground text-xs">
            This section is for general feedback about the submission.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4 sm:flex-row sm:justify-between">
        <p className="text-muted-foreground text-xs">
          {isReadOnly
            ? "This review has been submitted and is view-only."
            : "Please review all files above before submitting. Your review will be saved."}
        </p>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !canSubmit}
          className="w-full sm:w-auto sm:min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Submit Review
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
