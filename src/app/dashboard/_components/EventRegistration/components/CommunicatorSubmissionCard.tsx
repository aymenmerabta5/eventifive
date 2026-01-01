"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { computeFinalDecision, fillReviewerSlots } from "../utils";
import { REVIEW_STATUS_STYLES, MAX_REVIEWERS } from "../constants";
import type { CommunicatorSubmission, ReviewStatus, ReviewerLike } from "../types";

interface CommunicatorSubmissionCardProps {
  submission: CommunicatorSubmission;
  animationIndex: number;
}

export function CommunicatorSubmissionCard({
  submission,
  animationIndex,
}: CommunicatorSubmissionCardProps) {
  const sortedReviewers = [...submission.reviewers].sort((a, b) => {
    const left = a.reviewerName ?? a.reviewerEmail ?? "";
    const right = b.reviewerName ?? b.reviewerEmail ?? "";
    return left.localeCompare(right);
  });

  const reviewersWithPlaceholders = fillReviewerSlots(sortedReviewers);
  const decision = computeFinalDecision(
    reviewersWithPlaceholders as ReviewerLike[]
  );

  const breakdown = [
    `${decision.acceptedCount} accept${decision.acceptedCount === 1 ? "" : "s"}`,
    `${decision.rejectedCount} reject${decision.rejectedCount === 1 ? "" : "s"}`,
    ...(decision.pendingCount > 0 ? [`${decision.pendingCount} pending`] : []),
  ];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80",
        "transition-all duration-300",
        "hover:border-chart-2/30 hover:shadow-lg hover:shadow-chart-2/5"
      )}
    >
      {/* Pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.01] dark:opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "16px 16px",
        }}
      />

      <div className="relative space-y-4 p-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="font-display text-base font-semibold text-foreground">
              {submission.title}
            </div>
            <div className="text-sm text-muted-foreground">
              {submission.submitterName ?? "Unknown submitter"}
              {submission.submitterEmail ? ` • ${submission.submitterEmail}` : ""}
            </div>
            <div className="text-xs text-muted-foreground/80">
              {submission.submittedAt
                ? `Submitted ${new Date(submission.submittedAt).toLocaleDateString()}`
                : "Submission date not available"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "capitalize font-medium",
                REVIEW_STATUS_STYLES[decision.finalStatus]
              )}
            >
              {decision.finalStatus}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-muted/50 text-xs font-medium"
            >
              {submission.fileCount} file{submission.fileCount === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Review progress</span>
            <span>{breakdown.join(" • ")}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${((decision.acceptedCount + decision.rejectedCount) / MAX_REVIEWERS) * 100}%`,
              }}
              transition={{ delay: 0.2 + animationIndex * 0.1, duration: 0.5 }}
              className={cn(
                "h-full rounded-full",
                decision.finalStatus === "accepted"
                  ? "bg-primary"
                  : decision.finalStatus === "rejected"
                    ? "bg-destructive"
                    : "bg-chart-4"
              )}
            />
          </div>
        </div>

        {/* Reviewer Cards */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {reviewersWithPlaceholders.map((reviewer, idx) => {
            const status = (reviewer?.reviewStatus ?? "pending") as ReviewStatus;
            const timelinePieces = [
              reviewer?.inviteStatus ? `Invite: ${reviewer.inviteStatus}` : null,
              reviewer?.assignedAt
                ? `Assigned ${new Date(reviewer.assignedAt).toLocaleDateString()}`
                : null,
              reviewer?.reviewedAt
                ? `Reviewed ${new Date(reviewer.reviewedAt).toLocaleDateString()}`
                : null,
            ].filter(Boolean);

            return (
              <div
                key={`${submission.id}-reviewer-${idx}`}
                className={cn(
                  "space-y-2 rounded-lg border border-border/30 p-3",
                  "bg-gradient-to-br from-muted/20 to-muted/5"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium text-foreground">
                    {reviewer
                      ? reviewer.reviewerName || reviewer.reviewerEmail
                      : `Reviewer ${idx + 1}`}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs capitalize font-medium",
                      REVIEW_STATUS_STYLES[status]
                    )}
                  >
                    {status}
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {timelinePieces.length > 0
                    ? timelinePieces.join(" • ")
                    : "Not assigned yet"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Backwards compatibility alias
export { CommunicatorSubmissionCard as CommitteeSubmissionCard };
