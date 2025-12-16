"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc, client } from "@/utils/orpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Users,
  FileText,
  Presentation,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  RefreshCcw,
  Loader2,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion } from "motion/react";

type ReviewStatus = "pending" | "accepted" | "rejected";
type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";

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

const paymentStatusStyles: Record<PaymentStatus, string> = {
  unpaid: "border-amber-500/50 text-amber-600 bg-amber-500/10",
  pending: "border-amber-500/50 text-amber-600 bg-amber-500/10",
  paid: "border-green-600/60 text-green-700 bg-green-500/10",
  failed: "border-destructive/60 text-destructive bg-destructive/10",
  refunded: "border-blue-500/50 text-blue-600 bg-blue-500/10",
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

// Type for workshop submission from the list
type WorkshopSubmission = {
  id: string;
  title: string;
  submitterName: string | null;
  submitterEmail: string | null;
  submittedAt: Date | null;
  fileCount: number;
  status: "draft" | "accepted" | "rejected";
  abstract: string | null;
  keywords: string | null;
};

// Type for file from submission details
type SubmissionFile = {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  purpose: string | null;
};

// Workshop Submission Card with file viewing
function WorkshopSubmissionCard({
  submission,
  onAccept,
  onReject,
  isUpdating,
}: {
  submission: WorkshopSubmission;
  onAccept: () => void;
  onReject: () => void;
  isUpdating: boolean;
}) {
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [files, setFiles] = useState<SubmissionFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [hasLoadedFiles, setHasLoadedFiles] = useState(false);

  const status = submission.status;
  const hasDecision = status !== "draft";

  // Load files when expanded
  const handleToggleFiles = async () => {
    const newOpenState = !isFilesOpen;
    setIsFilesOpen(newOpenState);

    if (newOpenState && !hasLoadedFiles) {
      setIsLoadingFiles(true);
      try {
        const result = await client.submissions.get({ id: submission.id });
        setFiles(result.files);
        setHasLoadedFiles(true);
      } catch (error) {
        console.error("Failed to load files:", error);
        toast.error("Failed to load submission files");
      } finally {
        setIsLoadingFiles(false);
      }
    }
  };

  // Download file handler
  const handleDownload = async (fileId: string, fileName: string) => {
    setDownloadingFileId(fileId);
    try {
      const result = await client.files.getDownloadUrl({ fileId });
      // Open download URL in new tab
      const link = document.createElement("a");
      link.href = result.downloadUrl;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download file:", error);
      toast.error("Failed to download file");
    } finally {
      setDownloadingFileId(null);
    }
  };

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
            className={cn("text-xs capitalize", submissionStatusStyles[status])}
          >
            {status === "draft" ? "pending" : status}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {submission.fileCount} file{submission.fileCount === 1 ? "" : "s"}
          </Badge>
        </div>
      </div>

      {/* Abstract */}
      {submission.abstract ? (
        <div className="rounded-md bg-muted/40 p-4 text-sm text-muted-foreground">
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
            Abstract
          </div>
          {submission.abstract}
        </div>
      ) : null}

      

      {/* Files Section - Collapsible */}
      {submission.fileCount > 0 ? (
        <Collapsible open={isFilesOpen} onOpenChange={handleToggleFiles}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                View Attached Files ({submission.fileCount})
              </span>
              {isFilesOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            {isLoadingFiles ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading files...</span>
              </div>
            ) : files.length > 0 ? (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-md border bg-muted/30 p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{file.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.fileSize / 1024 / 1024).toFixed(2)} MB · {file.contentType}
                      </p>
                      {file.purpose ? (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {file.purpose}
                        </Badge>
                      ) : null}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(file.id, file.fileName)}
                      disabled={downloadingFileId === file.id}
                    >
                      {downloadingFileId === file.id ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-1 h-4 w-4" />
                      )}
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-2 text-center text-sm text-muted-foreground">
                No files found for this submission.
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
      ) : null}

      {/* Actions - Accept/Reject (one-time only) */}
      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        {hasDecision ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {status === "accepted" ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>This workshop has been <strong className="text-green-600">accepted</strong></span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-destructive" />
                <span>This workshop has been <strong className="text-destructive">rejected</strong></span>
              </>
            )}
          </div>
        ) : (
          <>
            <Button
              size="sm"
              variant="default"
              disabled={isUpdating}
              onClick={onAccept}
            >
              {isUpdating ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1 h-4 w-4" />
              )}
              Accept Workshop
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isUpdating}
              onClick={onReject}
            >
              {isUpdating ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-1 h-4 w-4" />
              )}
              Reject Workshop
            </Button>
            <span className="text-xs text-muted-foreground ml-2">
              (This decision is final)
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export function EventApprovalsCard({ eventId }: { eventId: string }) {
  const router = useRouter();

  const registrationsQuery = useQuery({
    ...orpc.submissions.listForOrganizer.queryOptions({
      input: { eventId },
    }),
  });

  const participantsQuery = useQuery({
    ...orpc.events.listParticipants.queryOptions({
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
  const participants = participantsQuery.data?.participants ?? [];
  const workshopSubmissions = submissions.filter((submission) =>
    isWorkshopSubmission(submission.keywords, submission.title),
  );
  const committeeSubmissions = submissions.filter(
    (submission) => !isWorkshopSubmission(submission.keywords, submission.title),
  );

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Compute statistics for each tab
  const workshopStats = {
    total: workshopSubmissions.length,
    accepted: workshopSubmissions.filter((s) => s.status === "accepted").length,
    rejected: workshopSubmissions.filter((s) => s.status === "rejected").length,
    pending: workshopSubmissions.filter((s) => s.status === "draft").length,
  };

  const committeeStats = {
    total: committeeSubmissions.length,
    reviewed: committeeSubmissions.filter((s) => {
      const decision = computeFinalDecision(
        s.reviewers.map((r) => ({ reviewStatus: r.reviewStatus as ReviewStatus })),
      );
      return decision.finalStatus !== "pending";
    }).length,
    pending: committeeSubmissions.filter((s) => {
      const decision = computeFinalDecision(
        s.reviewers.map((r) => ({ reviewStatus: r.reviewStatus as ReviewStatus })),
      );
      return decision.finalStatus === "pending";
    }).length,
  };

  const participantStats = {
    total: participants.length,
    paid: participants.filter((p) => p.paymentStatus === "paid").length,
    unpaid: participants.filter((p) => p.paymentStatus === "unpaid").length,
    pending: participants.filter((p) => p.paymentStatus === "pending").length,
  };

  const isRefetching = registrationsQuery.isRefetching || participantsQuery.isRefetching;

  const handleRefresh = () => {
    void registrationsQuery.refetch();
    void participantsQuery.refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header Section - matches my-events.tsx pattern */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Event Registrations</h1>
            <p className="text-muted-foreground">
              Manage participants, committee submissions, and workshop applications.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefetching}>
              {isRefetching ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 size-4" />
              )}
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard?view=my-events")}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to my events
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="participants" className="w-full space-y-6">
        <TabsList className="w-full h-12 justify-start">
            <TabsTrigger value="participants" className="gap-2">
              <Users className="size-4" />
              <span className="hidden text-md sm:inline">Participants</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {participants.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="committee-members" className="gap-2">
              <FileText className="size-4" />
              <span className="hidden text-md sm:inline">Committee Members</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {committeeSubmissions.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="workshop-facilitators" className="gap-2">
              <Presentation className="size-4" />
              <span className="hidden text-md sm:inline">Workshop Facilitators</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {workshopSubmissions.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-6">
            {/* Stats Summary Section */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <Users className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{participantStats.total}</div>
                  <p className="text-muted-foreground text-xs">All registered participants</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paid</CardTitle>
                  <CheckCircle2 className="size-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{participantStats.paid}</div>
                  <p className="text-muted-foreground text-xs">Payment confirmed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="size-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{participantStats.pending}</div>
                  <p className="text-muted-foreground text-xs">Awaiting payment</p>
                </CardContent>
              </Card>
            </div>

            {/* Participants List Section */}
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg font-semibold">Registered Participants</CardTitle>
                <CardDescription>
                  All users who have registered for this event.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {participantsQuery.isPending ? (
                  <div className="text-muted-foreground text-sm">Loading…</div>
                ) : null}

                {!participantsQuery.isPending && participants.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No participants yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Participants will appear here once they register for your event.
                    </p>
                  </div>
                ) : null}

                {participants.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(participant.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="truncate text-sm font-medium">
                            {participant.userName ?? "Unknown user"}
                          </div>
                          <div className="text-muted-foreground truncate text-xs">
                            {participant.userEmail}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] capitalize",
                                paymentStatusStyles[participant.paymentStatus],
                              )}
                            >
                              {participant.paymentStatus}
                            </Badge>
                            <span className="text-muted-foreground text-[10px]">
                              Registered {new Date(participant.registeredAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Committee Tab */}
          <TabsContent value="committee-members" className="space-y-6">
            {/* Stats Summary Section */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <FileText className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{committeeStats.total}</div>
                  <p className="text-muted-foreground text-xs">Papers submitted for review</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
                  <CheckCircle2 className="size-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{committeeStats.reviewed}</div>
                  <p className="text-muted-foreground text-xs">Completed reviews</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Clock className="size-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{committeeStats.pending}</div>
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
                {registrationsQuery.isPending ? (
                  <div className="text-muted-foreground text-sm">Loading…</div>
                ) : null}

                {!registrationsQuery.isPending && committeeSubmissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No committee submissions</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Committee submissions will appear here once researchers submit their papers.
                    </p>
                  </div>
                ) : null}

                {committeeSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {committeeSubmissions.map((submission, index) => {
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
                      ? [`${decision.pendingCount} pending`]
                      : []),
                  ];

                  return (
                    <div
                      key={submission.id}
                      className="space-y-4 rounded-lg border p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="text-base font-semibold">
                            {submission.title}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {submission.submitterName ?? "Unknown submitter"}
                            {submission.submitterEmail
                              ? ` • ${submission.submitterEmail}`
                              : ""}
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
                              reviewStatusStyles[decision.finalStatus],
                            )}
                          >
                            {decision.finalStatus}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {submission.fileCount} file
                            {submission.fileCount === 1 ? "" : "s"}
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
                            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                            className={cn(
                              "h-full rounded-full",
                              decision.finalStatus === "accepted"
                                ? "bg-green-500"
                                : decision.finalStatus === "rejected"
                                  ? "bg-destructive"
                                  : "bg-amber-500"
                            )}
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {reviewersWithPlaceholders.map((reviewer, idx) => {
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
                              key={`${submission.id}-reviewer-${idx}`}
                              className="space-y-2 rounded-md border bg-muted/30 p-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="text-sm font-medium">
                                  {reviewer
                                    ? reviewer.reviewerName ||
                                      reviewer.reviewerEmail
                                    : `Reviewer ${idx + 1}`}
                                </div>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs capitalize",
                                    reviewStatusStyles[status],
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
                })}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workshops Tab */}
          <TabsContent value="workshop-facilitators" className="space-y-6">
            {/* Stats Summary Section */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <Presentation className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workshopStats.total}</div>
                  <p className="text-muted-foreground text-xs">All applications</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                  <CheckCircle2 className="size-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{workshopStats.accepted}</div>
                  <p className="text-muted-foreground text-xs">Approved workshops</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="size-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{workshopStats.pending}</div>
                  <p className="text-muted-foreground text-xs">Awaiting decision</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                  <XCircle className="size-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{workshopStats.rejected}</div>
                  <p className="text-muted-foreground text-xs">Not approved</p>
                </CardContent>
              </Card>
            </div>

            {/* Workshop Applications List Section */}
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg font-semibold">Workshop Applications</CardTitle>
                <CardDescription>
                  Facilitator applications for workshop sessions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {registrationsQuery.isPending ? (
                  <div className="text-muted-foreground text-sm">Loading…</div>
                ) : null}

                {!registrationsQuery.isPending && workshopSubmissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                    <Presentation className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No workshop applications</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Workshop facilitator applications will appear here once they&apos;re submitted.
                    </p>
                  </div>
                ) : null}

                {workshopSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {workshopSubmissions.map((submission) => (
                      <WorkshopSubmissionCard
                        key={submission.id}
                        submission={submission}
                        onAccept={() =>
                          updateStatusMutation.mutate({
                            submissionId: submission.id,
                            status: "accepted",
                          })
                        }
                        onReject={() =>
                          updateStatusMutation.mutate({
                            submissionId: submission.id,
                            status: "rejected",
                          })
                        }
                        isUpdating={updateStatusMutation.isPending}
                      />
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}
