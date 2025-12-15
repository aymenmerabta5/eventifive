"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import { orpc } from "@/utils/orpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
type ReviewStatus = "pending" | "accepted" | "rejected";

const reviewStatusStyles: Record<ReviewStatus, string> = {
  pending: "border-amber-500/50 text-amber-600 bg-amber-500/10",
  accepted: "border-green-600/60 text-green-700 bg-green-500/10",
  rejected: "border-destructive/60 text-destructive bg-destructive/10",
};

const MAX_REVIEWERS = 3;

type ReviewerLike =
  | {
      reviewStatus: ReviewStatus;
    }
  | null;

const computeFinalDecision = (reviewers: ReviewerLike[]) => {
  const acceptedCount = reviewers.filter(
    (reviewer) => reviewer?.reviewStatus === "accepted",
  ).length;
  const rejectedCount = reviewers.filter(
    (reviewer) => reviewer?.reviewStatus === "rejected",
  ).length;
  const pendingCount = reviewers.length - acceptedCount - rejectedCount;

  const finalStatus: ReviewStatus =
    acceptedCount >= 2
      ? "accepted"
      : pendingCount > 0
        ? "pending"
        : "rejected";

  return { acceptedCount, rejectedCount, pendingCount, finalStatus };
};

const submissionStatusStyles: Record<"draft" | "accepted" | "rejected", string> =
  {
    draft: "border-amber-500/50 text-amber-600 bg-amber-500/10",
    accepted: "border-green-600/60 text-green-700 bg-green-500/10",
    rejected: "border-destructive/60 text-destructive bg-destructive/10",
  };

const isWorkshopSubmission = (keywords?: string | null, title?: string | null) => {
  if (!keywords && !title) return false;
  const normalizedKeywords = keywords?.toLowerCase() ?? "";
  const normalizedTitle = title?.toLowerCase() ?? "";
  return (
    normalizedKeywords.includes("workshop") ||
    normalizedTitle.startsWith("workshop application")
  );
};

export function EventApprovalsCard({ eventId }: { eventId: string }) {
  const router = useRouter();

  const eventQuery = useQuery({
    ...orpc.events.get.queryOptions({
      input: { id: eventId },
    }),
  });

  const registrationsQuery = useQuery({
    ...orpc.submissions.listForOrganizer.queryOptions({
      input: { eventId },
    }),
  });

  const updateStatusMutation = useMutation(
    orpc.submissions.updateStatus.mutationOptions({
      onSuccess: () => {
        toast.success("Updated workshop status");
        registrationsQuery.refetch();
      },
      onError: (error) => {
        console.error("Failed to update status:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update status",
        );
      },
    }),
  );

  const submissions = registrationsQuery.data?.submissions ?? [];
  const reviewBasePath =
    eventQuery.data?.type != null ? `/events/${eventQuery.data.type}/${eventId}/review` : null;
  const workshopSubmissions = submissions.filter((submission) =>
    isWorkshopSubmission(submission.keywords, submission.title),
  );
  const committeeSubmissions = submissions.filter(
    (submission) => !isWorkshopSubmission(submission.keywords, submission.title),
  );

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold md:text-3xl">
          Committee registrations
        </CardTitle>
        <CardDescription>
          See every committee application and the verdict from each reviewer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Event</div>
          <div className="text-muted-foreground mt-1 text-xs">
            Event ID: <span className="font-mono">{eventId}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard?view=my-events")}
            >
              Back to my events
            </Button>
          </div>
        </div>

        <div className="space-y-6 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium">Workshop facilitator applications</div>
            <Badge variant="outline" className="text-xs">
              {workshopSubmissions.length} record
              {workshopSubmissions.length === 1 ? "" : "s"}
            </Badge>
          </div>

          {registrationsQuery.isPending ? (
            <div className="text-muted-foreground text-sm">Loading…</div>
          ) : null}

          {!registrationsQuery.isPending && workshopSubmissions.length === 0 ? (
            <div className="text-muted-foreground text-sm">
              No workshop applications yet.
            </div>
          ) : null}

          {workshopSubmissions.length > 0 ? (
            <div className="space-y-4">
              {workshopSubmissions.map((submission) => {
                const status = submission.status;
                return (
                  <div
                    key={submission.id}
                    className="space-y-3 rounded-lg border p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold">
                          {submission.title}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {submission.submitterName ?? "Unknown submitter"}
                          {submission.submitterEmail
                            ? ` (${submission.submitterEmail})`
                            : ""}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {submission.submittedAt
                            ? `Submitted ${new Date(submission.submittedAt).toLocaleDateString()}`
                            : "Not available"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs capitalize",
                            submissionStatusStyles[status],
                          )}
                        >
                          {status}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {submission.fileCount} file
                          {submission.fileCount === 1 ? "" : "s"}
                        </Badge>
                      </div>
                    </div>

                    {submission.abstract ? (
                      <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                        {submission.abstract}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={
                          status === "accepted" ||
                          updateStatusMutation.isPending
                        }
                        onClick={() =>
                          updateStatusMutation.mutate({
                            submissionId: submission.id,
                            status: "accepted",
                          })
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          status === "rejected" ||
                          updateStatusMutation.isPending
                        }
                        onClick={() =>
                          updateStatusMutation.mutate({
                            submissionId: submission.id,
                            status: "rejected",
                          })
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium">Committee registrations</div>
            <Badge variant="outline" className="text-xs">
              {committeeSubmissions.length} record
              {committeeSubmissions.length === 1 ? "" : "s"}
            </Badge>
          </div>

          {registrationsQuery.isPending ? (
            <div className="text-muted-foreground text-sm">Loading…</div>
          ) : null}

          {!registrationsQuery.isPending && committeeSubmissions.length === 0 ? (
            <div className="text-muted-foreground text-sm">
              No committee registrations yet.
            </div>
          ) : null}

          {committeeSubmissions.length > 0 ? (
            <div className="space-y-4">
              {committeeSubmissions.map((submission) => {
                const sortedReviewers = [...submission.reviewers].sort(
                  (a, b) => {
                    const left = a.reviewerName ?? a.reviewerEmail ?? "";
                    const right = b.reviewerName ?? b.reviewerEmail ?? "";
                    return left.localeCompare(right);
                  },
                );

                const reviewersWithPlaceholders = [
                  ...sortedReviewers.slice(0, MAX_REVIEWERS),
                  ...Array(Math.max(0, MAX_REVIEWERS - sortedReviewers.length)),
                ].map((entry) => entry ?? null);

                const decision = computeFinalDecision(
                  reviewersWithPlaceholders as ReviewerLike[],
                );
                const breakdown = [
                  `${decision.acceptedCount} accept${decision.acceptedCount === 1 ? "" : "s"}`,
                  `${decision.rejectedCount} reject${decision.rejectedCount === 1 ? "" : "s"}`,
                  ...(decision.pendingCount > 0
                    ? [
                        `${decision.pendingCount} pending${decision.pendingCount === 1 ? "" : "s"}`,
                      ]
                    : []),
                ];

                return (
                  <div
                    key={submission.id}
                    className="space-y-3 rounded-lg border p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold">
                          {submission.title}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {submission.submitterName ?? "Unknown submitter"}
                          {submission.submitterEmail
                            ? ` (${submission.submitterEmail})`
                            : ""}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {submission.submittedAt
                            ? `Submitted ${new Date(submission.submittedAt).toLocaleDateString()}`
                            : "Not available"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {submission.fileCount} file
                          {submission.fileCount === 1 ? "" : "s"}
                        </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (!reviewBasePath) return;
                          router.push(
                            `${reviewBasePath}?submissionId=${submission.id}` as Route,
                          );
                        }}
                        disabled={!reviewBasePath || eventQuery.isPending}
                      >
                        Review application
                      </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {reviewersWithPlaceholders.map((reviewer, index) => {
                        const status = (reviewer?.reviewStatus ??
                          "pending") as ReviewStatus;
                        const timelinePieces = [
                          reviewer?.inviteStatus
                            ? `Invite: ${reviewer.inviteStatus}`
                            : null,
                          reviewer?.assignedAt
                            ? `Assigned ${new Date(reviewer.assignedAt).toLocaleDateString()}`
                            : null,
                          reviewer?.reviewedAt
                            ? `Reviewed ${new Date(reviewer.reviewedAt).toLocaleDateString()}`
                            : null,
                        ].filter(Boolean);

                        return (
                          <div
                            key={`${submission.id}-reviewer-${index}`}
                            className="space-y-2 rounded-md border p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-sm font-medium">
                                {reviewer
                                  ? reviewer.reviewerName ||
                                    reviewer.reviewerEmail
                                  : `Reviewer ${index + 1}`}
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "capitalize",
                                  reviewStatusStyles[status],
                                )}
                              >
                                {status}
                              </Badge>
                            </div>
                            {reviewer?.recommendation ? (
                              <Badge
                                variant="outline"
                                className="capitalize text-[11px]"
                              >
                                {reviewer.recommendation}
                              </Badge>
                            ) : null}
                            <div className="text-muted-foreground text-[11px]">
                              {timelinePieces.length > 0
                                ? timelinePieces.join(" • ")
                                : "Not assigned yet"}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          reviewStatusStyles[decision.finalStatus],
                        )}
                      >
                        {decision.finalStatus}
                      </Badge>
                      <div className="text-muted-foreground text-xs">
                        {breakdown.join(" • ")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
