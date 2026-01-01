"use client";

import { cn } from "@/lib/utils";
import { IconFileText, IconLoader2 } from "@tabler/icons-react";
import { CommunicatorStatsCards } from "./CommunicatorStatsCards";
import { CommunicatorSubmissionCard } from "./CommunicatorSubmissionCard";
import { computeFinalDecision } from "../utils";
import type { CommunicatorSubmission, ReviewStatus } from "../types";

interface CommunicatorTabProps {
  submissions: CommunicatorSubmission[];
  isLoading: boolean;
}

export function CommunicatorTab({ submissions, isLoading }: CommunicatorTabProps) {
  const stats = {
    total: submissions.length,
    reviewed: submissions.filter((s) => {
      const decision = computeFinalDecision(
        s.reviewers.map((r) => ({
          reviewStatus: r.reviewStatus as ReviewStatus,
        }))
      );
      return decision.finalStatus !== "pending";
    }).length,
    pending: submissions.filter((s) => {
      const decision = computeFinalDecision(
        s.reviewers.map((r) => ({
          reviewStatus: r.reviewStatus as ReviewStatus,
        }))
      );
      return decision.finalStatus === "pending";
    }).length,
  };

  return (
    <div className="space-y-6">
      <CommunicatorStatsCards
        total={stats.total}
        reviewed={stats.reviewed}
        pending={stats.pending}
      />

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/50",
          "bg-gradient-to-br from-card via-card to-card/80"
        )}
      >
        {/* Pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Accent strip */}
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-chart-2 via-chart-2/80 to-primary" />

        <div className="relative p-6">
          <div className="mb-6 space-y-1">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Paper Submissions
            </h3>
            <p className="text-sm text-muted-foreground">
              Research papers submitted for review.
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <IconLoader2 className="size-6 animate-spin text-chart-2" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading submissions...
              </span>
            </div>
          )}

          {!isLoading && submissions.length === 0 && (
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 p-12",
                "bg-gradient-to-br from-muted/30 to-muted/10"
              )}
            >
              <div
                className={cn(
                  "mb-4 flex size-16 items-center justify-center rounded-2xl",
                  "bg-gradient-to-br from-chart-2/10 to-primary/10"
                )}
              >
                <IconFileText className="size-8 text-chart-2/60" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                No submissions yet
              </h3>
              <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                Submissions will appear here once researchers submit their papers.
              </p>
            </div>
          )}

          {submissions.length > 0 && (
            <div className="space-y-4">
              {submissions.map((submission, index) => (
                <CommunicatorSubmissionCard
                  key={submission.id}
                  submission={submission}
                  animationIndex={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Backwards compatibility alias
export { CommunicatorTab as CommitteeTab };
