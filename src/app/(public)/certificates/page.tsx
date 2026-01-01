"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

const roleConfig: Record<string, { label: string; icon: typeof IconUserStar; className: string }> = {
  speaker: {
    label: "Speaker",
    icon: IconMicrophone2,
    className: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
  communicator: {
    label: "Communicator",
    icon: IconUsers,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  reviewer: {
    label: "Reviewer",
    icon: IconEye,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  facilitator: {
    label: "Facilitator",
    icon: IconUserStar,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
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
        "group relative overflow-hidden rounded-2xl border transition-all duration-300",
        "bg-gradient-to-br from-card to-card/80",
        "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
      )}
    >
      {/* Gradient accent at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

      {/* Certificate ribbon decoration */}
      <div className="absolute -top-3 -right-3 size-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rotate-45 transform" />

      <div className="p-5 pt-6">
        {/* Header: Role & Event Type */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <Badge variant="outline" className={cn("gap-1.5 font-medium", role.className)}>
            <RoleIcon className="size-3.5" />
            {role.label}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {formatEventType(cert.eventType)}
          </Badge>
        </div>

        {/* Event Title & Session */}
        <div className="space-y-1 mb-4">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {cert.eventTitle}
          </h3>
          {cert.sessionTitle && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {cert.sessionTitle}
            </p>
          )}
        </div>

        {/* Certificate Details */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center gap-2.5 text-sm">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
              <IconCalendarEvent className="size-4 text-primary" />
            </div>
            <span className="text-muted-foreground">{formatDate(cert.eventStartDate)}</span>
          </div>

          {cert.eventLocation && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                <IconMapPin className="size-4 text-primary" />
              </div>
              <span className="text-muted-foreground line-clamp-1">{cert.eventLocation}</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-sm">
            <div className="flex items-center justify-center size-8 rounded-lg bg-amber-500/10">
              <IconShieldCheck className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
            <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
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
            <Link href={`/verify/${cert.verificationCode}` as Route} target="_blank">
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
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const { data: certificates, isLoading } = useQuery({
    ...orpc.certificates.listMyCertificates.queryOptions({}),
    enabled: !!session,
  });

  const handleDownload = async (certificateId: string) => {
    setDownloadingId(certificateId);
    try {
      const certData = await orpc.certificates.download.call({
        certificateId,
      });

      const baseUrl = window.location.origin;
      const qrCodeDataUrl = await generateQRCodeDataUrl(
        certData.verificationCode,
        baseUrl
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
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <IconLoader2 className="size-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your certificates...</p>
        </div>
      </div>
    );
  }

  // Auth required
  if (!session) {
    redirect("/login");
  }

  const hasCertificates = certificates && certificates.length > 0;

  return (
    <div className="container mx-auto min-h-screen py-8 px-4">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
            <IconAward className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Certificates</h1>
            <p className="text-muted-foreground text-sm">
              Download and share your certificates of appreciation
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {!hasCertificates ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center size-20 rounded-3xl bg-muted/50 mb-6">
            <IconCertificate className="size-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
          <p className="text-muted-foreground max-w-md">
            You haven&apos;t received any certificates yet. Certificates are issued when events you participated in have ended.
          </p>
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
  );
}
