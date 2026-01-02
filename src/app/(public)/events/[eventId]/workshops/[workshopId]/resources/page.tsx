"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  IconPresentation,
  IconCalendarEvent,
  IconUsers,
  IconDownload,
  IconLoader2,
  IconAlertTriangle,
  IconLock,
  IconArrowLeft,
  IconFile,
  IconFileTypePdf,
  IconFileTypeDoc,
  IconFileTypePpt,
  IconFileTypeXls,
  IconFileTypeZip,
  IconPhoto,
  IconVideo,
  IconFileDownload,
  IconUserPlus,
} from "@tabler/icons-react";
import { format } from "date-fns";
import Link from "next/link";
import { useState, useCallback } from "react";

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

export default function WorkshopResourcesPage() {
  const params = useParams<{ eventId: string; workshopId: string }>();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const {
    data: materialsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...orpc.workshops.listMaterials.queryOptions({
      input: { workshopId: params.workshopId },
    }),
    enabled: !!params.workshopId,
  });

  // Get workshop details (public endpoint)
  const { data: workshopData, isLoading: isLoadingWorkshop } = useQuery({
    ...orpc.workshops.getDetails.queryOptions({
      input: { workshopId: params.workshopId },
    }),
    enabled: !!params.workshopId,
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
        toast.success(`Downloading ${fileName}`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to download file",
        );
      } finally {
        setDownloadingId(null);
      }
    },
    [],
  );

  // Loading state
  if (isLoading || isLoadingWorkshop) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <BackgroundPattern />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <IconLoader2 className="size-8 animate-spin text-emerald-500" />
            </div>
            <p className="text-muted-foreground text-sm">
              Loading workshop resources...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <BackgroundPattern />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
          <Card className="border-destructive/30 max-w-md">
            <CardContent className="p-6 text-center">
              <div className="bg-destructive/10 mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl">
                <IconAlertTriangle className="text-destructive size-8" />
              </div>
              <h2 className="font-display text-lg font-semibold">
                Unable to Load Resources
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                {error.message || "Something went wrong. Please try again."}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button variant="outline" onClick={() => refetch()}>
                  Try Again
                </Button>
                <Button variant="ghost" asChild>
                  <Link href={`/events/${params.eventId}`}>
                    <IconArrowLeft className="mr-2 size-4" />
                    Back to Event
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Not accessible (not registered)
  if (!materialsData?.isAccessible) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <BackgroundPattern />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
          <Card className="max-w-md border-amber-500/30">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-amber-500/10">
                <IconLock className="size-8 text-amber-500" />
              </div>
              <h2 className="font-display text-lg font-semibold">
                Registration Required
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                You need to register for this workshop to access the materials.
              </p>
              {materialsData?.workshopTitle && (
                <p className="mt-3 font-medium">
                  {materialsData.workshopTitle}
                </p>
              )}
              <div className="mt-6 flex justify-center gap-3">
                <Button asChild>
                  <Link href={`/events/${params.eventId}`}>
                    <IconUserPlus className="mr-2 size-4" />
                    Register for Workshop
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const materials = materialsData?.materials ?? [];
  const workshopTitle =
    materialsData?.workshopTitle ?? workshopData?.workshop?.title ?? "Workshop";
  const workshop = workshopData?.workshop;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundPattern />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="animate-in fade-in slide-in-from-bottom-4 text-center duration-700">
            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-emerald-500/10">
              <IconFileDownload className="size-10 text-emerald-500" />
            </div>
            <h1 className="font-display text-foreground text-3xl font-bold">
              Workshop Resources
            </h1>
            <p className="text-muted-foreground mt-2">
              Download materials shared by the facilitator
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
              <div className="flex items-start gap-4">
                <div className="flex size-14 items-center justify-center rounded-xl bg-emerald-500/10">
                  <IconPresentation className="size-7 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-bold">
                    {workshopTitle}
                  </h2>
                  {workshop && (
                    <div className="text-muted-foreground mt-2 flex flex-wrap gap-4 text-sm">
                      {workshop.facilitatorName && (
                        <div className="flex items-center gap-1">
                          <IconUsers className="size-4" />
                          <span>Facilitated by {workshop.facilitatorName}</span>
                        </div>
                      )}
                      {workshop.startAt && (
                        <div className="flex items-center gap-1">
                          <IconCalendarEvent className="size-4" />
                          <span>
                            {format(
                              new Date(workshop.startAt),
                              "MMM d, h:mm a",
                            )}
                            {workshop.endAt &&
                              ` - ${format(new Date(workshop.endAt), "h:mm a")}`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Materials List */}
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
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10">
                    <IconDownload className="size-6 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold">
                      Available Materials
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {materials.length} file{materials.length !== 1 ? "s" : ""}{" "}
                      available for download
                    </p>
                  </div>
                </div>

                {/* Materials */}
                {materials.length === 0 ? (
                  <div className="border-border/50 bg-muted/30 rounded-xl border py-12 text-center">
                    <div className="bg-muted/50 mx-auto mb-4 flex size-14 items-center justify-center rounded-xl">
                      <IconFile className="text-muted-foreground size-7" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      No materials have been uploaded yet.
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Check back later for updates.
                    </p>
                  </div>
                ) : (
                  <div className="divide-border/40 border-border/60 divide-y rounded-xl border">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="hover:bg-muted/30 flex items-center gap-4 p-4 transition-colors"
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
                            {format(
                              new Date(material.uploadedAt),
                              "MMM d, yyyy",
                            )}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500"
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
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Back link */}
          <div className="animate-in fade-in fill-mode-backwards text-center duration-700 [animation-delay:300ms]">
            <Button variant="ghost" asChild className="gap-2">
              <Link href={`/events/${params.eventId}`}>
                <IconArrowLeft className="size-4" />
                Back to Event
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackgroundPattern() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Large gradient orb - top right */}
      <div className="animate-pulse-slow absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent blur-3xl" />

      {/* Medium gradient orb - bottom left */}
      <div className="animate-pulse-slow from-chart-2/30 via-chart-3/20 absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tr to-transparent blur-3xl [animation-delay:1s]" />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating geometric shapes */}
      <div className="absolute top-1/4 left-[10%] h-3 w-3 rotate-45 border-2 border-emerald-500/20 opacity-60" />
      <div className="border-chart-2/30 absolute top-1/3 right-[15%] h-4 w-4 rounded-full border-2" />
      <div className="absolute bottom-1/4 left-[20%] h-2 w-8 rounded-full bg-emerald-500/10" />
      <div className="border-chart-3/20 absolute top-2/3 right-[10%] h-6 w-6 rotate-12 rounded-lg border" />
    </div>
  );
}
