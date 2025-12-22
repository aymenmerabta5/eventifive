"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, ExternalLink, Loader2, Calendar, MapPin } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { CertificateTemplate } from "@/lib/certificates/CertificateTemplate";
import { generateQRCodeDataUrl } from "@/lib/certificates/generateQRCode";
import { useState } from "react";
import { toast } from "sonner";
import type { CertificateRole } from "@/server/db/schema";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatEventType = (type: string): string => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "speaker":
      return "default";
    case "committee":
      return "secondary";
    case "reviewer":
      return "outline";
    case "facilitator":
      return "default";
    default:
      return "secondary";
  }
};

const getRoleLabel = (role: string): string => {
  switch (role) {
    case "speaker":
      return "Speaker";
    case "committee":
      return "Committee";
    case "reviewer":
      return "Reviewer";
    case "facilitator":
      return "Facilitator";
    default:
      return "Participant";
  }
};

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

      // Generate QR code with verification URL
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

  if (isSessionPending) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-foreground text-2xl font-bold">My Certificates</h1>
          <p className="text-muted-foreground">
            Download and share your certificates of appreciation
          </p>
        </div>

        {!certificates || certificates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                No Certificates Yet
              </h3>
              <p className="text-muted-foreground">
                You haven&apos;t received any certificates yet. Certificates are issued
                when events you participated in have ended.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <Card key={cert.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge variant={getRoleBadgeVariant(cert.role)}>
                      {getRoleLabel(cert.role)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {formatEventType(cert.eventType)}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2 line-clamp-2 text-lg">
                    {cert.eventTitle}
                  </CardTitle>
                  {cert.sessionTitle && (
                    <CardDescription className="line-clamp-1">
                      {cert.sessionTitle}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between">
                  <div className="space-y-2 text-sm">
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(cert.eventStartDate)}</span>
                    </div>
                    {cert.eventLocation && (
                      <div className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{cert.eventLocation}</span>
                      </div>
                    )}
                    <div className="text-muted-foreground">
                      <span className="font-medium">Verification:</span>{" "}
                      <code className="text-primary text-xs">
                        {cert.verificationCode}
                      </code>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(cert.id)}
                      disabled={downloadingId === cert.id}
                    >
                      {downloadingId === cert.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Download
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={`/verify/${cert.verificationCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
