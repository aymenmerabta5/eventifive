"use client";

import { useQuery } from "@tanstack/react-query";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ReviewStatus = "pending" | "accepted" | "rejected";

const reviewStatusStyles: Record<ReviewStatus, string> = {
  pending: "border-amber-500/50 text-amber-600 bg-amber-500/10",
  accepted: "border-green-600/60 text-green-700 bg-green-500/10",
  rejected: "border-destructive/60 text-destructive bg-destructive/10",
};

const MAX_REVIEWERS = 3;

export function EventApprovalsCard({ eventId }: { eventId: string }) {
  const router = useRouter();

  const registrationsQuery = useQuery({
    ...orpc.submissions.listForOrganizer.queryOptions({
      input: { eventId },
    }),
  });

  const submissions = registrationsQuery.data?.submissions ?? [];

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

        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium">Committee registrations</div>
            <Badge variant="outline" className="text-xs">
              {submissions.length} record{submissions.length === 1 ? "" : "s"}
            </Badge>
          </div>

          {registrationsQuery.isPending ? (
            <div className="text-muted-foreground text-sm">Loading…</div>
          ) : null}

          {!registrationsQuery.isPending && submissions.length === 0 ? (
            <div className="text-muted-foreground text-sm">
              No committee registrations yet.
            </div>
          ) : null}

          {submissions.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[220px]">
                      Committee registration
                    </TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-center">Reviewer 1</TableHead>
                    <TableHead className="text-center">Reviewer 2</TableHead>
                    <TableHead className="text-center">Reviewer 3</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => {
                    const sortedReviewers = [...submission.reviewers].sort(
                      (a, b) => {
                        const left = a.reviewerName ?? a.reviewerEmail ?? "";
                        const right = b.reviewerName ?? b.reviewerEmail ?? "";
                        return left.localeCompare(right);
                      },
                    );

                    const reviewersWithPlaceholders = [
                      ...sortedReviewers.slice(0, MAX_REVIEWERS),
                      ...Array(
                        Math.max(0, MAX_REVIEWERS - sortedReviewers.length),
                      ).fill(null),
                    ];

                    return (
                      <TableRow key={submission.id} className="align-top">
                        <TableCell>
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
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="secondary" className="text-xs">
                            {submission.fileCount} file
                            {submission.fileCount === 1 ? "" : "s"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {submission.submittedAt
                            ? new Date(
                                submission.submittedAt,
                              ).toLocaleDateString()
                            : "Not available"}
                        </TableCell>
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
                            <TableCell
                              key={`${submission.id}-reviewer-${index}`}
                              className="min-w-[160px]"
                            >
                              <div className="flex flex-col gap-1 text-center">
                                <div className="text-sm font-medium">
                                  {reviewer
                                    ? reviewer.reviewerName ||
                                      reviewer.reviewerEmail
                                    : `Reviewer ${index + 1}`}
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "capitalize",
                                      reviewStatusStyles[status],
                                    )}
                                  >
                                    {status}
                                  </Badge>
                                  {reviewer?.recommendation ? (
                                    <Badge
                                      variant="outline"
                                      className="capitalize"
                                    >
                                      {reviewer.recommendation}
                                    </Badge>
                                  ) : null}
                                </div>
                                <div className="text-muted-foreground text-[11px]">
                                  {timelinePieces.length > 0
                                    ? timelinePieces.join(" • ")
                                    : "Not assigned yet"}
                                </div>
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
