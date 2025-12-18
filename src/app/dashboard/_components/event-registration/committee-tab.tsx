"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileText, CheckCircle2, Clock } from "lucide-react";
import { motion } from "motion/react";
import {
  type CommitteeSubmission,
  type ReviewStatus,
  type ReviewerLike,
  reviewStatusStyles,
  computeFinalDecision,
  MAX_REVIEWERS,
} from "./event-registration-utils";

type CommitteeTabProps = {
  submissions: CommitteeSubmission[];
  isLoading: boolean;
};

export function CommitteeTab({ submissions, isLoading }: CommitteeTabProps) {
  
  const stats = {
    total: submissions.length,
    reviewed: submissions.filter((s) => {
      const decision = computeFinalDecision(
        s.reviewers.map((r) => ({ reviewStatus: r.reviewStatus as ReviewStatus })),
      );
      return decision.finalStatus !== "pending";
    }).length,
    pending: submissions.filter((s) => {
      const decision = computeFinalDecision(
        s.reviewers.map((r) => ({ reviewStatus: r.reviewStatus as ReviewStatus })),
      );
      return decision.finalStatus === "pending";
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-muted-foreground text-xs">Papers submitted for review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
            <CheckCircle2 className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.reviewed}</div>
            <p className="text-muted-foreground text-xs">Completed reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-muted-foreground text-xs">Awaiting committee decision</p>
          </CardContent>
        </Card>
      </div>

      {/* Committee Submissions List Section */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold">Paper Submissions</CardTitle>
          <CardDescription>
            Research papers submitted for committee review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground text-sm">Loading…</div>
          ) : null}

          {!isLoading && submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No committee submissions</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Committee submissions will appear here once researchers submit their papers.
              </p>
            </div>
          ) : null}

          {submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((submission, index) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  animationIndex={index}
                />
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * SubmissionCard - Individual paper submission with reviewers
 * 
 * WHY IT'S SEPARATE:
 * Extracting this as a separate component improves readability
 * and allows the animation logic to be self-contained.
 */
function SubmissionCard({
  submission,
  animationIndex,
}: {
  submission: CommitteeSubmission;
  animationIndex: number;
}) {
  // Sort reviewers alphabetically for consistent display
  const sortedReviewers = [...submission.reviewers].sort((a, b) => {
    const left = a.reviewerName ?? a.reviewerEmail ?? "";
    const right = b.reviewerName ?? b.reviewerEmail ?? "";
    return left.localeCompare(right);
  });

  // Fill remaining slots with null placeholders up to MAX_REVIEWERS
  const reviewersWithPlaceholders = [
    ...sortedReviewers.slice(0, MAX_REVIEWERS),
    ...Array(Math.max(0, MAX_REVIEWERS - sortedReviewers.length)),
  ].map((entry) => entry ?? null);

  const decision = computeFinalDecision(reviewersWithPlaceholders as ReviewerLike[]);
  
  // Build breakdown text for display
  const breakdown = [
    `${decision.acceptedCount} accept${decision.acceptedCount === 1 ? "" : "s"}`,
    `${decision.rejectedCount} reject${decision.rejectedCount === 1 ? "" : "s"}`,
    ...(decision.pendingCount > 0 ? [`${decision.pendingCount} pending`] : []),
  ];

  return (
    <div className="space-y-4 rounded-lg border p-4">
      {/* Header with title, submitter info, and status */}
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
            className={cn("capitalize", reviewStatusStyles[decision.finalStatus])}
          >
            {decision.finalStatus}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {submission.fileCount} file{submission.fileCount === 1 ? "" : "s"}
          </Badge>
        </div>
      </div>

      {/* Animated Progress bar for reviews */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Review progress</span>
          <span>{breakdown.join(" • ")}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
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

      {/* Reviewer Cards Grid */}
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
              className="space-y-2 rounded-md border bg-muted/30 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-medium">
                  {reviewer
                    ? reviewer.reviewerName || reviewer.reviewerEmail
                    : `Reviewer ${idx + 1}`}
                </div>
                <Badge
                  variant="outline"
                  className={cn("text-xs capitalize", reviewStatusStyles[status])}
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

