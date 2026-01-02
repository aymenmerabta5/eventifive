"use client";

import { useState, useCallback, type ChangeEvent, type DragEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  IconPresentation,
  IconCalendarEvent,
  IconUsers,
  IconFileUpload,
  IconTrash,
  IconDownload,
  IconLoader2,
  IconAlertTriangle,
  IconCheck,
  IconCloudUpload,
  IconFile,
  IconFileTypePdf,
  IconFileTypeDoc,
  IconFileTypePpt,
  IconFileTypeXls,
  IconFileTypeZip,
  IconPhoto,
  IconVideo,
  IconX,
  IconArrowLeft,
} from "@tabler/icons-react";
import { format } from "date-fns";
import Link from "next/link";

interface WorkshopManageViewProps {
  workshopId: string;
  workshopTitle: string;
  eventTitle: string;
  startAt: Date | null;
  endAt: Date | null;
  capacity: number | null;
  description: string | null;
  researchDomain: string | null;
}

const MAX_MATERIALS = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
  "image/png",
  "image/jpeg",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileIcon(contentType: string) {
  if (contentType === "application/pdf") {
    return <IconFileTypePdf className="size-6 text-red-500" />;
  }
  if (
    contentType === "application/msword" ||
    contentType.includes("wordprocessingml")
  ) {
    return <IconFileTypeDoc className="size-6 text-blue-500" />;
  }
  if (
    contentType === "application/vnd.ms-powerpoint" ||
    contentType.includes("presentationml")
  ) {
    return <IconFileTypePpt className="size-6 text-orange-500" />;
  }
  if (
    contentType === "application/vnd.ms-excel" ||
    contentType.includes("spreadsheetml")
  ) {
    return <IconFileTypeXls className="size-6 text-green-500" />;
  }
  if (contentType.includes("zip")) {
    return <IconFileTypeZip className="size-6 text-yellow-500" />;
  }
  if (contentType.startsWith("image/")) {
    return <IconPhoto className="size-6 text-purple-500" />;
  }
  if (contentType.startsWith("video/")) {
    return <IconVideo className="size-6 text-pink-500" />;
  }
  return <IconFile className="text-muted-foreground size-6" />;
}

export function WorkshopManageView({
  workshopId,
  workshopTitle,
  eventTitle,
  startAt,
  endAt,
  capacity,
  description,
  researchDomain,
}: WorkshopManageViewProps) {
  const queryClient = useQueryClient();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Fetch materials
  const {
    data: materialsData,
    isLoading: isLoadingMaterials,
    error: materialsError,
    refetch: refetchMaterials,
  } = useQuery({
    ...orpc.workshops.listMaterials.queryOptions({
      input: { workshopId },
    }),
    enabled: !!workshopId,
  });

  const materials = materialsData?.materials ?? [];
  const canUploadMore = materials.length < MAX_MATERIALS;

  // Delete mutation
  const deleteMutation = useMutation({
    ...orpc.workshops.deleteMaterial.mutationOptions(),
    onSuccess: () => {
      toast.success("Material deleted");
      queryClient.invalidateQueries({
        queryKey: orpc.workshops.listMaterials.key({ input: { workshopId } }),
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete material");
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  // Download handler
  const handleDownload = useCallback(
    async (workshopFileId: string, fileName: string) => {
      setDownloadingId(workshopFileId);
      try {
        const result = await orpc.workshops.getMaterialDownload.call({
          workshopFileId,
        });
        // Open download URL in new tab
        window.open(result.downloadUrl, "_blank");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to get download URL",
        );
      } finally {
        setDownloadingId(null);
      }
    },
    [],
  );

  // Upload handler
  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];
      if (!file) return;

      // Validate file type
      if (!ALLOWED_TYPES.has(file.type)) {
        toast.error("Invalid file type. Please upload a supported format.");
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File too large. Maximum size is 50MB.");
        return;
      }

      // Check quota
      if (materials.length >= MAX_MATERIALS) {
        toast.error(`Maximum ${MAX_MATERIALS} materials allowed per workshop`);
        return;
      }

      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("workshopId", workshopId);

        const response = await fetch("/api/upload-workshop-material", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Upload failed");
        }

        toast.success("Material uploaded successfully");
        setUploadProgress(100);

        // Refetch materials list
        await refetchMaterials();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to upload material",
        );
      } finally {
        setTimeout(() => setUploadProgress(null), 1000);
      }
    },
    [workshopId, materials.length, refetchMaterials],
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleUpload(e.target.files);
      e.target.value = ""; // Reset input
    },
    [handleUpload],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      handleUpload(e.dataTransfer.files);
    },
    [handleUpload],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDelete = useCallback(
    (workshopFileId: string) => {
      if (deletingId) return;
      setDeletingId(workshopFileId);
      deleteMutation.mutate({ workshopFileId });
    },
    [deleteMutation, deletingId],
  );

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <div className="animate-in fade-in slide-in-from-bottom-4 text-center duration-700">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-emerald-500/10">
            <IconPresentation className="size-10 text-emerald-500" />
          </div>
          <h1 className="font-display text-foreground text-3xl font-bold">
            Workshop Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your workshop and upload materials for attendees
          </p>
        </div>

        {/* Workshop Info Card */}
        <Card
          className={cn(
            "animate-in fade-in slide-in-from-bottom-6 fill-mode-backwards duration-700 [animation-delay:100ms]",
            "border-border/50 relative overflow-hidden",
            "from-card via-card to-card/80 bg-gradient-to-b",
          )}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold">
                    {workshopTitle}
                  </h2>
                  <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                    <IconCalendarEvent className="size-4" />
                    <span>{eventTitle}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-500">
                  <IconCheck className="size-4" />
                  Accepted
                </div>
              </div>

              {/* Workshop details grid */}
              <div className="border-border/50 grid gap-4 border-t pt-4 sm:grid-cols-3">
                {startAt && endAt && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Schedule</span>
                    <p className="font-medium">
                      {format(new Date(startAt), "MMM d, h:mm a")} -{" "}
                      {format(new Date(endAt), "h:mm a")}
                    </p>
                  </div>
                )}
                {capacity && (
                  <div className="text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <IconUsers className="size-3" /> Capacity
                    </span>
                    <p className="font-medium">{capacity} attendees</p>
                  </div>
                )}
                {researchDomain && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Domain</span>
                    <p className="font-medium">{researchDomain}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Materials Upload Card */}
        <Card
          className={cn(
            "animate-in fade-in slide-in-from-bottom-6 fill-mode-backwards duration-700 [animation-delay:200ms]",
            "border-border/50 relative overflow-hidden",
            "from-card via-card to-card/80 bg-gradient-to-b",
            "shadow-xl shadow-emerald-500/5",
          )}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          <div className="absolute -top-24 -right-24 size-48 rounded-full bg-emerald-500/5 blur-2xl" />

          <CardContent className="relative p-6 sm:p-8">
            <div className="space-y-6">
              {/* Section header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10">
                    <IconFileUpload className="size-6 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold">
                      Workshop Materials
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {materials.length}/{MAX_MATERIALS} files uploaded
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload zone */}
              {canUploadMore && (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-300",
                    isDragOver
                      ? "border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/5"
                      : "border-border/60 hover:bg-muted/30 hover:border-emerald-500/40",
                    uploadProgress !== null && "pointer-events-none opacity-50",
                  )}
                >
                  {uploadProgress !== null ? (
                    <div className="w-full max-w-xs space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <IconLoader2 className="size-5 animate-spin text-emerald-500" />
                        <span className="text-sm font-medium">
                          Uploading...
                        </span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  ) : (
                    <>
                      <div
                        className={cn(
                          "flex size-14 items-center justify-center rounded-2xl transition-all",
                          isDragOver
                            ? "scale-110 bg-emerald-500/20"
                            : "bg-muted",
                        )}
                      >
                        <IconCloudUpload
                          className={cn(
                            "size-7 transition-colors",
                            isDragOver
                              ? "text-emerald-500"
                              : "text-muted-foreground",
                          )}
                        />
                      </div>
                      <div className="mt-4 text-center">
                        <p className="font-medium">
                          {isDragOver
                            ? "Drop to upload"
                            : "Drag and drop files here"}
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm">
                          or{" "}
                          <label className="cursor-pointer font-medium text-emerald-500 hover:underline">
                            browse
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg,.jpeg,.gif,.mp4,.webm"
                              onChange={handleFileChange}
                            />
                          </label>
                        </p>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        {[
                          "PDF",
                          "DOC",
                          "PPT",
                          "XLS",
                          "ZIP",
                          "Images",
                          "Video",
                        ].map((format) => (
                          <span
                            key={format}
                            className="border-border/60 bg-card text-muted-foreground rounded-full border px-2.5 py-1 text-xs"
                          >
                            {format}
                          </span>
                        ))}
                      </div>
                      <p className="text-muted-foreground mt-2 text-xs">
                        Max 50MB per file
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Materials list */}
              {isLoadingMaterials ? (
                <div className="flex items-center justify-center py-8">
                  <IconLoader2 className="size-6 animate-spin text-emerald-500" />
                </div>
              ) : materialsError ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <IconAlertTriangle className="text-destructive size-8" />
                  <p className="text-muted-foreground mt-2 text-sm">
                    Failed to load materials
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetchMaterials()}
                    className="mt-2"
                  >
                    Try again
                  </Button>
                </div>
              ) : materials.length === 0 ? (
                <div className="border-border/50 bg-muted/30 rounded-xl border py-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    No materials uploaded yet. Upload files to share with
                    attendees.
                  </p>
                </div>
              ) : (
                <div className="divide-border/40 border-border/60 divide-y rounded-xl border">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="group hover:bg-muted/30 flex items-center gap-4 p-4 transition-colors"
                    >
                      <div className="bg-muted/50 flex size-12 items-center justify-center rounded-xl">
                        {getFileIcon(material.contentType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {material.fileName}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatFileSize(material.fileSize)} •{" "}
                          {format(new Date(material.uploadedAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 hover:bg-emerald-500/10 hover:text-emerald-500"
                          onClick={() =>
                            handleDownload(material.id, material.fileName)
                          }
                          disabled={downloadingId === material.id}
                        >
                          {downloadingId === material.id ? (
                            <IconLoader2 className="size-4 animate-spin" />
                          ) : (
                            <IconDownload className="size-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-destructive/10 hover:text-destructive size-8"
                          onClick={() => handleDelete(material.id)}
                          disabled={deletingId === material.id}
                        >
                          {deletingId === material.id ? (
                            <IconLoader2 className="size-4 animate-spin" />
                          ) : (
                            <IconTrash className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Max limit notice */}
              {!canUploadMore && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
                  <IconAlertTriangle className="size-4" />
                  Maximum {MAX_MATERIALS} materials reached. Delete existing
                  files to upload new ones.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Back link */}
        <div className="animate-in fade-in fill-mode-backwards text-center duration-700 [animation-delay:300ms]">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/registrations">
              <IconArrowLeft className="size-4" />
              Back to My Registrations
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
