"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { computeFinalDecision, fillReviewerSlots } from "../utils";
import { REVIEW_STATUS_STYLES, MAX_REVIEWERS } from "../constants";
import type { CommitteeSubmission, ReviewStatus, ReviewerLike } from "../types";

interface CommitteeSubmissionCardProps {
  submission: CommitteeSubmission;
  animationIndex: number;
}

export function CommitteeSubmissionCard({
  submission,
  animationIndex,
}: CommitteeSubmissionCardProps) {
  const sortedReviewers = [...submission.reviewers].sort((a, b) => {
    const left = a.reviewerName ?? a.reviewerEmail ?? "";
    const right = b.reviewerName ?? b.reviewerEmail ?? "";
    return left.localeCompare(right);
  });

  const reviewersWithPlaceholders = fillReviewerSlots(sortedReviewers);
  const decision = computeFinalDecision(
    reviewersWithPlaceholders as ReviewerLike[],
  );

  const breakdown = [
    `${decision.acceptedCount} accept${decision.acceptedCount === 1 ? "" : "s"}`,
    `${decision.rejectedCount} reject${decision.rejectedCount === 1 ? "" : "s"}`,
    ...(decision.pendingCount > 0 ? [`${decision.pendingCount} pending`] : []),
  ];

  return (
    <div className="space-y-4 rounded-lg border p-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-base font-semibold">{submission.title}</div>
          <div className="text-muted-foreground text-sm">
            {submission.submitterName ?? "Unknown submitter"}
            {submission.submitterEmail ? ` • ${submission.submitterEmail}` : ""}
          </div>
          <div className="text-muted-foreground text-xs">
            {submission.submittedAt
              ? `Submitted ${new Date(submission.submittedAt).toLocaleDateString()}`
              : "Submission date not available"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "capitalize",
              REVIEW_STATUS_STYLES[decision.finalStatus],
            )}
          >
            {decision.finalStatus}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {submission.fileCount} file{submission.fileCount === 1 ? "" : "s"}
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>Review progress</span>
          <span>{breakdown.join(" • ")}</span>
        </div>
        <div className="bg-muted h-2 overflow-hidden rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${((decision.acceptedCount + decision.rejectedCount) / MAX_REVIEWERS) * 100}%`,
            }}
            transition={{ delay: 0.2 + animationIndex * 0.1, duration: 0.5 }}
            className={cn(
              "h-full rounded-full",
              decision.finalStatus === "accepted"
                ? "bg-green-500"
                : decision.finalStatus === "rejected"
                  ? "bg-destructive"
                  : "bg-amber-500",
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
              className="bg-muted/30 space-y-2 rounded-md border p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-medium">
                  {reviewer
                    ? reviewer.reviewerName || reviewer.reviewerEmail
                    : `Reviewer ${idx + 1}`}
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs capitalize",
                    REVIEW_STATUS_STYLES[status],
                  )}
                >
                  {status}
                </Badge>
              </div>
              <div className="text-muted-foreground text-[11px]">
                {timelinePieces.length > 0
                  ? timelinePieces.join(" • ")
                  : "Not assigned yet"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
