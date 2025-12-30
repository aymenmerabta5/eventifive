"use client";

import { cn } from "@/lib/utils";
import { IconPresentation, IconLoader2 } from "@tabler/icons-react";
import { WorkshopStatsCards } from "./WorkshopStatsCards";
import { WorkshopSubmissionCard } from "./WorkshopSubmissionCard";
import type { WorkshopSubmission } from "../types";

interface WorkshopTabProps {
  submissions: WorkshopSubmission[];
  isLoading: boolean;
  onAccept: (submissionId: string) => void;
  onReject: (submissionId: string) => void;
  isUpdating: boolean;
}

export function WorkshopTab({
  submissions,
  isLoading,
  onAccept,
  onReject,
  isUpdating,
}: WorkshopTabProps) {
  const stats = {
    total: submissions.length,
    accepted: submissions.filter((s) => s.status === "accepted").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
    pending: submissions.filter((s) => s.status === "draft").length,
  };

  return (
    <div className="space-y-6">
      <WorkshopStatsCards
        total={stats.total}
        accepted={stats.accepted}
        pending={stats.pending}
        rejected={stats.rejected}
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
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-chart-3 via-chart-3/80 to-primary" />

        <div className="relative p-6">
          <div className="mb-6 space-y-1">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Workshop Applications
            </h3>
            <p className="text-sm text-muted-foreground">
              Facilitator applications for workshop sessions.
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <IconLoader2 className="size-6 animate-spin text-chart-3" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading applications...
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
                  "bg-gradient-to-br from-chart-3/10 to-primary/10"
                )}
              >
                <IconPresentation className="size-8 text-chart-3/60" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                No workshop applications
              </h3>
              <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                Workshop facilitator applications will appear here once
                they&apos;re submitted.
              </p>
            </div>
          )}

          {submissions.length > 0 && (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <WorkshopSubmissionCard
                  key={submission.id}
                  submission={submission}
                  onAccept={() => onAccept(submission.id)}
                  onReject={() => onReject(submission.id)}
                  isUpdating={isUpdating}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
