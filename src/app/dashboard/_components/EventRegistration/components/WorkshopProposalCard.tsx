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
  IconFileText,
  IconCircleCheck,
  IconCircleX,
  IconLoader2,
  IconDownload,
  IconChevronDown,
  IconChevronUp,
  IconUsers,
  IconFlask,
} from "@tabler/icons-react";
import { WORKSHOP_PROPOSAL_STATUS_STYLES } from "../constants";
import { AcceptWorkshopModal } from "./AcceptWorkshopModal";
import { RejectWorkshopModal } from "./RejectWorkshopModal";
import type { WorkshopProposal, WorkshopProposalFile } from "../types";

interface WorkshopProposalCardProps {
  proposal: WorkshopProposal;
  onAccept: (workshopId: string, startAt?: string, endAt?: string) => void;
  onReject: (workshopId: string, reason: string) => void;
  isAccepting: boolean;
  isRejecting: boolean;
}

export function WorkshopProposalCard({
  proposal,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
}: WorkshopProposalCardProps) {
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [files, setFiles] = useState<WorkshopProposalFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(
    null,
  );
  const [hasLoadedFiles, setHasLoadedFiles] = useState(false);

  // Modal states
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const status = proposal.proposalStatus;
  const hasDecision = status !== "pending";
  const isUpdating = isAccepting || isRejecting;

  const handleToggleFiles = async () => {
    const newOpenState = !isFilesOpen;
    setIsFilesOpen(newOpenState);

    if (newOpenState && !hasLoadedFiles) {
      setIsLoadingFiles(true);
      try {
        const result = await client.workshops.get({ workshopId: proposal.id });
        setFiles(result.files);
        setHasLoadedFiles(true);
      } catch (error) {
        console.error("Failed to load files:", error);
        toast.error("Failed to load workshop files");
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

  const handleAcceptConfirm = (startAt?: string, endAt?: string) => {
    onAccept(proposal.id, startAt, endAt);
    setIsAcceptModalOpen(false);
  };

  const handleRejectConfirm = (reason: string) => {
    onReject(proposal.id, reason);
    setIsRejectModalOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border/50",
          "bg-gradient-to-br from-card via-card to-card/80",
          "transition-all duration-300",
          "hover:border-chart-3/30 hover:shadow-lg hover:shadow-chart-3/5",
        )}
      >
        {/* Pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.01] dark:opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "16px 16px",
          }}
        />

        <div className="relative space-y-4 p-5">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="font-display text-base font-semibold text-foreground">
                {proposal.title}
              </div>
              <div className="text-sm text-muted-foreground">
                {proposal.facilitator.name}
                {proposal.facilitator.email
                  ? ` • ${proposal.facilitator.email}`
                  : ""}
              </div>
              <div className="text-xs text-muted-foreground/80">
                Proposed{" "}
                {new Date(proposal.proposedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-medium capitalize",
                  WORKSHOP_PROPOSAL_STATUS_STYLES[status],
                )}
              >
                {status}
              </Badge>
            </div>
          </div>

          {/* Research Domain & Capacity */}
          {(proposal.researchDomain || proposal.capacity) && (
            <div className="flex flex-wrap gap-3">
              {proposal.researchDomain && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <IconFlask className="size-4" />
                  <span>{proposal.researchDomain}</span>
                </div>
              )}
              {proposal.capacity && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <IconUsers className="size-4" />
                  <span>{proposal.capacity} max attendees</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {proposal.description && (
            <div
              className={cn(
                "rounded-lg border border-border/30 p-4",
                "bg-gradient-to-br from-muted/20 to-muted/5",
              )}
            >
              <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                Description
              </div>
              <p className="text-sm text-muted-foreground">
                {proposal.description}
              </p>
            </div>
          )}

          {/* Rejection Reason */}
          {status === "rejected" && proposal.rejectionReason && (
            <div
              className={cn(
                "rounded-lg border border-destructive/30 p-4",
                "bg-gradient-to-br from-destructive/5 to-destructive/10",
              )}
            >
              <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-destructive/70">
                Rejection Reason
              </div>
              <p className="text-sm text-destructive/80">
                {proposal.rejectionReason}
              </p>
            </div>
          )}

          {/* Files Section */}
          <Collapsible open={isFilesOpen} onOpenChange={handleToggleFiles}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-between",
                  "hover:bg-chart-3/5 hover:text-chart-3",
                )}
              >
                <span className="flex items-center gap-2">
                  <IconFileText className="size-4" />
                  View Attached Files
                </span>
                {isFilesOpen ? (
                  <IconChevronUp className="size-4" />
                ) : (
                  <IconChevronDown className="size-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-4">
                  <IconLoader2 className="size-5 animate-spin text-chart-3" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading files...
                  </span>
                </div>
              ) : files.length > 0 ? (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border border-border/30 p-3",
                        "bg-gradient-to-br from-muted/20 to-muted/5",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-10 items-center justify-center rounded-lg",
                          "bg-gradient-to-br from-chart-3/10 to-primary/10",
                        )}
                      >
                        <IconFileText className="size-5 text-chart-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {file.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.fileSize / 1024 / 1024).toFixed(2)} MB ·{" "}
                          {file.contentType}
                        </p>
                        {file.purpose && (
                          <Badge
                            variant="outline"
                            className="mt-1 border-border/50 text-xs"
                          >
                            {file.purpose}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file.id, file.fileName)}
                        disabled={downloadingFileId === file.id}
                        className="gap-1.5 border-border/50 hover:border-chart-3/50 hover:bg-chart-3/5"
                      >
                        {downloadingFileId === file.id ? (
                          <IconLoader2 className="size-4 animate-spin" />
                        ) : (
                          <IconDownload className="size-4" />
                        )}
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-2 text-center text-sm text-muted-foreground">
                  No files attached to this proposal.
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border/30 pt-4">
            {hasDecision ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {status === "accepted" ? (
                  <>
                    <IconCircleCheck className="size-4 text-primary" />
                    <span>
                      This workshop has been{" "}
                      <strong className="text-primary">accepted</strong>
                      {proposal.respondedAt && (
                        <span className="ml-1 text-muted-foreground/60">
                          on{" "}
                          {new Date(proposal.respondedAt).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <IconCircleX className="size-4 text-destructive" />
                    <span>
                      This workshop has been{" "}
                      <strong className="text-destructive">rejected</strong>
                      {proposal.respondedAt && (
                        <span className="ml-1 text-muted-foreground/60">
                          on{" "}
                          {new Date(proposal.respondedAt).toLocaleDateString()}
                        </span>
                      )}
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
                  onClick={() => setIsAcceptModalOpen(true)}
                  className="gap-1.5"
                >
                  {isAccepting ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    <IconCircleCheck className="size-4" />
                  )}
                  Accept Workshop
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => setIsRejectModalOpen(true)}
                  className="gap-1.5 border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                >
                  {isRejecting ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    <IconCircleX className="size-4" />
                  )}
                  Reject Workshop
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AcceptWorkshopModal
        open={isAcceptModalOpen}
        onOpenChange={setIsAcceptModalOpen}
        workshopTitle={proposal.title}
        onConfirm={handleAcceptConfirm}
        isLoading={isAccepting}
      />
      <RejectWorkshopModal
        open={isRejectModalOpen}
        onOpenChange={setIsRejectModalOpen}
        workshopTitle={proposal.title}
        onConfirm={handleRejectConfirm}
        isLoading={isRejecting}
      />
    </>
  );
}
