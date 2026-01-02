"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconLoader2,
  IconAward,
  IconDownload,
  IconExternalLink,
  IconCalendarEvent,
  IconMapPin,
  IconShieldCheck,
  IconMicrophone2,
  IconUsers,
  IconEye,
  IconUserStar,
  IconCertificate,
  IconSparkles,
} from "@tabler/icons-react";
import { pdf } from "@react-pdf/renderer";
import { CertificateTemplate } from "@/lib/certificates/CertificateTemplate";
import { generateQRCodeDataUrl } from "@/lib/certificates/generateQRCode";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { CertificateRole } from "@/server/db/schema";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Route } from "next";

// ============================================================================
// Types & Helpers
// ============================================================================

const roleConfig: Record<
  string,
  { label: string; icon: typeof IconUserStar; className: string }
> = {
  speaker: {
    label: "Speaker",
    icon: IconMicrophone2,
    className:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
  communicator: {
    label: "Communicator",
    icon: IconUsers,
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  reviewer: {
    label: "Reviewer",
    icon: IconEye,
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  facilitator: {
    label: "Facilitator",
    icon: IconUserStar,
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
};

const formatEventType = (type: string): string => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

interface Certificate {
  id: string;
  eventTitle: string;
  eventType: string;
  eventStartDate: Date;
  eventEndDate: Date;
  eventLocation: string | null;
  role: string;
  sessionTitle: string | null;
  verificationCode: string;
  issuedAt: Date;
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <div className="border-border/40 bg-card/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="size-14 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-16 w-28 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-border/50 bg-card rounded-2xl border p-5"
            >
              <div className="mb-4 flex justify-between">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="mb-2 h-6 w-full" />
              <Skeleton className="mb-4 h-4 w-3/4" />
              <div className="mb-5 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-8 rounded-lg" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-8 rounded-lg" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex items-center gap-2.5">
                  <Skeleton className="size-8 rounded-lg" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-md" />
                <Skeleton className="h-9 w-10 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Stat Card Component
// ============================================================================

interface StatCardProps {
  label: string;
  value: number;
  icon: typeof IconAward;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <div className="border-border/50 bg-card/80 flex items-center gap-3 rounded-xl border px-4 py-3 backdrop-blur-sm">
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-xl",
          bgColor,
        )}
      >
        <Icon className={cn("size-5", color)} />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-muted-foreground text-xs">{label}</p>
      </div>
    </div>
  );
}

// ============================================================================
// Certificate Card Component
// ============================================================================

function CertificateCard({
  cert,
  onDownload,
  isDownloading,
}: {
  cert: Certificate;
  onDownload: (id: string) => void;
  isDownloading: boolean;
}) {
  const role = roleConfig[cert.role] ?? roleConfig.facilitator!;
  const RoleIcon = role.icon;

  return (
    <div
      className={cn(
        "group border-border/50 relative overflow-hidden rounded-2xl border transition-all duration-300",
        "bg-card hover:border-border",
        "hover:shadow-primary/5 hover:-translate-y-0.5 hover:shadow-lg",
      )}
    >
      {/* Gradient accent at top */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

      {/* Certificate ribbon decoration */}
      <div className="absolute -top-3 -right-3 size-16 rotate-45 transform bg-gradient-to-br from-amber-500/20 to-orange-500/20" />

      <div className="p-5 pt-6">
        {/* Header: Role & Event Type */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <Badge
            variant="outline"
            className={cn("gap-1.5 font-medium", role.className)}
          >
            <RoleIcon className="size-3.5" />
            {role.label}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {formatEventType(cert.eventType)}
          </Badge>
        </div>

        {/* Event Title & Session */}
        <div className="mb-4 space-y-1">
          <h3 className="group-hover:text-primary line-clamp-2 text-lg leading-tight font-semibold transition-colors">
            {cert.eventTitle}
          </h3>
          {cert.sessionTitle && (
            <p className="text-muted-foreground line-clamp-1 text-sm">
              {cert.sessionTitle}
            </p>
          )}
        </div>

        {/* Certificate Details */}
        <div className="mb-5 space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm">
            <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
              <IconCalendarEvent className="text-primary size-4" />
            </div>
            <span className="text-muted-foreground">
              {formatDate(cert.eventStartDate)}
            </span>
          </div>

          {cert.eventLocation && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                <IconMapPin className="text-primary size-4" />
              </div>
              <span className="text-muted-foreground line-clamp-1">
                {cert.eventLocation}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-sm">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10">
              <IconShieldCheck className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
            <code className="text-muted-foreground bg-muted rounded px-2 py-0.5 font-mono text-xs">
              {cert.verificationCode}
            </code>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onDownload(cert.id)}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconDownload className="size-4" />
            )}
            Download PDF
          </Button>
          <Button size="sm" variant="outline" className="px-2.5" asChild>
            <Link
              href={`/verify/${cert.verificationCode}` as Route}
              target="_blank"
            >
              <IconExternalLink className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function CertificatesPage() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const { data: certificates, isLoading } = useQuery({
    ...orpc.certificates.listMyCertificates.queryOptions({}),
    enabled: !!session,
  });

  // Count certificates by role
  const roleCounts = useMemo(() => {
    if (!certificates) return { total: 0 };
    return {
      total: certificates.length,
    };
  }, [certificates]);

  const handleDownload = async (certificateId: string) => {
    setDownloadingId(certificateId);
    try {
      const certData = await orpc.certificates.download.call({
        certificateId,
      });

      const baseUrl = window.location.origin;
      const qrCodeDataUrl = await generateQRCodeDataUrl(
        certData.verificationCode,
        baseUrl,
      );

      const doc = (
        <CertificateTemplate
          recipientName={certData.recipientName}
          eventTitle={certData.eventTitle}
          eventType={certData.eventType}
          eventStartDate={certData.eventStartDate}
          eventEndDate={certData.eventEndDate}
          eventLocation={certData.eventLocation}
          role={certData.role as CertificateRole}
          sessionTitle={certData.sessionTitle}
          verificationCode={certData.verificationCode}
          issuedAt={certData.issuedAt}
          qrCodeDataUrl={qrCodeDataUrl}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${certData.verificationCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("Failed to download certificate:", error);
      toast.error("Failed to download certificate. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Loading state
  if (isSessionPending || isLoading) {
    return <LoadingSkeleton />;
  }

  // Auth required
  if (!session) {
    redirect("/login");
  }

  const hasCertificates = certificates && certificates.length > 0;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="border-border/40 bg-card/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
                <IconAward className="size-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  My Certificates
                </h1>
                <p className="text-muted-foreground">
                  Download and share your certificates of appreciation
                </p>
              </div>
            </div>

            {/* Stats */}
            {hasCertificates && (
              <div className="flex flex-wrap gap-3">
                <StatCard
                  label="Total"
                  value={roleCounts.total}
                  icon={IconSparkles}
                  color="text-amber-500"
                  bgColor="bg-amber-500/10"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {!hasCertificates ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 scale-150 rounded-full bg-amber-500/10 blur-2xl" />
              <div className="border-border/50 bg-card relative flex size-24 items-center justify-center rounded-3xl border">
                <IconCertificate className="text-muted-foreground size-12" />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold">No Certificates Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              You haven&apos;t received any certificates yet. Certificates are
              issued when events you participated in have ended.
            </p>
            <Button asChild className="gap-2 rounded-full px-6">
              <Link href="/events">
                <IconCalendarEvent className="size-4" />
                Browse Events
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <CertificateCard
                key={cert.id}
                cert={cert}
                onDownload={handleDownload}
                isDownloading={downloadingId === cert.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
