"use client";

/**
 * WorkshopTab Component
 * 
 * WHAT THIS COMPONENT DOES:
 * Displays workshop facilitator applications with accept/reject functionality.
 * Unlike committee submissions, workshop decisions are made directly by organizers.
 * 
 * KEY FEATURES:
 * 1. Collapsible file viewer for each submission
 * 2. Direct download of attached files via presigned URLs
 * 3. One-time accept/reject decision (final and irreversible)
 */

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { client } from "@/utils/orpc";
import { toast } from "sonner";
import {
  Presentation,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  type WorkshopSubmission,
  type SubmissionFile,
  submissionStatusStyles,
} from "./event-registration-utils";

type WorkshopTabProps = {
  submissions: WorkshopSubmission[];
  isLoading: boolean;
  onAccept: (submissionId: string) => void;
  onReject: (submissionId: string) => void;
  isUpdating: boolean;
};

export function WorkshopTab({
  submissions,
  isLoading,
  onAccept,
  onReject,
  isUpdating,
}: WorkshopTabProps) {
  // Compute statistics for the stats cards
  const stats = {
    total: submissions.length,
    accepted: submissions.filter((s) => s.status === "accepted").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
    pending: submissions.filter((s) => s.status === "draft").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Presentation className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-muted-foreground text-xs">All applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle2 className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <p className="text-muted-foreground text-xs">Approved workshops</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-muted-foreground text-xs">Awaiting decision</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
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
          {isLoading ? (
            <div className="text-muted-foreground text-sm">Loading…</div>
          ) : null}

          {!isLoading && submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <Presentation className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No workshop applications</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Workshop facilitator applications will appear here once they&apos;re submitted.
              </p>
            </div>
          ) : null}

          {submissions.length > 0 ? (
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
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * WorkshopSubmissionCard - Individual workshop application with file viewer
 * 
 * WHY IT'S INTERNAL TO THIS FILE:
 * This component is tightly coupled to the WorkshopTab and uses
 * the same mutation handlers. Keeping it here maintains cohesion.
 * 
 * LAZY LOADING PATTERN:
 * Files are only fetched when the user expands the collapsible section.
 * This reduces initial load time and API calls for large lists.
 */
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

  /**
   * Loads files on-demand when the collapsible is expanded.
   * Uses a flag to prevent redundant API calls on subsequent toggles.
   */
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

  /**
   * Downloads a file by fetching a presigned URL and triggering browser download.
   * Creates a temporary link element for proper download behavior.
   */
  const handleDownload = async (fileId: string, fileName: string) => {
    setDownloadingFileId(fileId);
    try {
      const result = await client.files.getDownloadUrl({ fileId });
      // Create temporary link for download
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
                <span>
                  This workshop has been{" "}
                  <strong className="text-green-600">accepted</strong>
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-destructive" />
                <span>
                  This workshop has been{" "}
                  <strong className="text-destructive">rejected</strong>
                </span>
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
            <span className="ml-2 text-xs text-muted-foreground">
              (This decision is final)
            </span>
          </>
        )}
      </div>
    </div>
  );
}

