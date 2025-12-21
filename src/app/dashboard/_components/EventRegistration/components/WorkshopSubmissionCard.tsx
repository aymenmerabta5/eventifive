"use client";

import { useState } from "react";
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
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SUBMISSION_STATUS_STYLES } from "../constants";
import type { WorkshopSubmission, SubmissionFile } from "../types";

interface WorkshopSubmissionCardProps {
  submission: WorkshopSubmission;
  onAccept: () => void;
  onReject: () => void;
  isUpdating: boolean;
}

export function WorkshopSubmissionCard({
  submission,
  onAccept,
  onReject,
  isUpdating,
}: WorkshopSubmissionCardProps) {
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [files, setFiles] = useState<SubmissionFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(
    null,
  );
  const [hasLoadedFiles, setHasLoadedFiles] = useState(false);

  const status = submission.status;
  const hasDecision = status !== "draft";

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

  const handleDownload = async (fileId: string, fileName: string) => {
    setDownloadingFileId(fileId);
    try {
      const result = await client.files.getDownloadUrl({ fileId });
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
            className={cn(
              "text-xs capitalize",
              SUBMISSION_STATUS_STYLES[status],
            )}
          >
            {status === "draft" ? "pending" : status}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {submission.fileCount} file{submission.fileCount === 1 ? "" : "s"}
          </Badge>
        </div>
      </div>

      {/* Abstract */}
      {submission.abstract && (
        <div className="bg-muted/40 text-muted-foreground rounded-md p-4 text-sm">
          <div className="text-muted-foreground/70 mb-1 text-xs font-medium tracking-wide uppercase">
            Abstract
          </div>
          {submission.abstract}
        </div>
      )}

      {/* Files Section */}
      {submission.fileCount > 0 && (
        <Collapsible open={isFilesOpen} onOpenChange={handleToggleFiles}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
            >
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
                <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
                <span className="text-muted-foreground ml-2 text-sm">
                  Loading files...
                </span>
              </div>
            ) : files.length > 0 ? (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="bg-muted/30 flex items-center gap-3 rounded-md border p-3"
                  >
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                      <FileText className="text-primary h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {file.fileName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {(file.fileSize / 1024 / 1024).toFixed(2)} MB ·{" "}
                        {file.contentType}
                      </p>
                      {file.purpose && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {file.purpose}
                        </Badge>
                      )}
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
              <p className="text-muted-foreground py-2 text-center text-sm">
                No files found for this submission.
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        {hasDecision ? (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
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
                <XCircle className="text-destructive h-4 w-4" />
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
            <span className="text-muted-foreground ml-2 text-xs">
              (This decision is final)
            </span>
          </>
        )}
      </div>
    </div>
  );
}
