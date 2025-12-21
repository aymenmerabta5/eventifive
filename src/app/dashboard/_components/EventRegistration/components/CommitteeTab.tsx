"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";
import { CommitteeStatsCards } from "./CommitteeStatsCards";
import { CommitteeSubmissionCard } from "./CommitteeSubmissionCard";
import { computeFinalDecision } from "../utils";
import type { CommitteeSubmission, ReviewStatus } from "../types";

interface CommitteeTabProps {
  submissions: CommitteeSubmission[];
  isLoading: boolean;
}

export function CommitteeTab({ submissions, isLoading }: CommitteeTabProps) {
  const stats = {
    total: submissions.length,
    reviewed: submissions.filter((s) => {
      const decision = computeFinalDecision(
        s.reviewers.map((r) => ({
          reviewStatus: r.reviewStatus as ReviewStatus,
        })),
      );
      return decision.finalStatus !== "pending";
    }).length,
    pending: submissions.filter((s) => {
      const decision = computeFinalDecision(
        s.reviewers.map((r) => ({
          reviewStatus: r.reviewStatus as ReviewStatus,
        })),
      );
      return decision.finalStatus === "pending";
    }).length,
  };

  return (
    <div className="space-y-6">
      <CommitteeStatsCards
        total={stats.total}
        reviewed={stats.reviewed}
        pending={stats.pending}
      />

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold">
            Paper Submissions
          </CardTitle>
          <CardDescription>
            Research papers submitted for committee review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-muted-foreground text-sm">Loading...</div>
          )}

          {!isLoading && submissions.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <FileText className="text-muted-foreground/50 h-12 w-12" />
              <h3 className="mt-4 text-lg font-semibold">
                No committee submissions
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Committee submissions will appear here once researchers submit
                their papers.
              </p>
            </div>
          )}

          {submissions.length > 0 && (
            <div className="space-y-4">
              {submissions.map((submission, index) => (
                <CommitteeSubmissionCard
                  key={submission.id}
                  submission={submission}
                  animationIndex={index}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
