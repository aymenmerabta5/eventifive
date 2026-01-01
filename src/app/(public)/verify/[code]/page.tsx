"use client";

import { use } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2, Award } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
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
    case "communicator":
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
    case "communicator":
      return "Communicator";
    case "reviewer":
      return "Reviewer";
    case "facilitator":
      return "Workshop Facilitator";
    default:
      return "Participant";
  }
};

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function VerifyCertificatePage({ params }: PageProps) {
  const { code } = use(params);

  const { data, isLoading, error } = useQuery({
    ...orpc.certificates.verify.queryOptions({
      input: { code },
    }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="text-primary mx-auto h-16 w-16 animate-spin" />
          <h1 className="text-foreground text-2xl font-bold">
            Verifying Certificate...
          </h1>
          <p className="text-muted-foreground">
            Please wait while we verify this certificate.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
              <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-foreground text-3xl font-bold">
              Verification Error
            </h1>
            <p className="text-muted-foreground">
              An error occurred while verifying this certificate. Please try again later.
            </p>
          </div>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Certificate not found
  if (!data?.certificate) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/30">
              <AlertCircle className="h-16 w-16 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-foreground text-3xl font-bold">
              Certificate Not Found
            </h1>
            <p className="text-muted-foreground">
              No certificate was found with the verification code:{" "}
              <span className="font-mono font-semibold">{code}</span>
            </p>
            <p className="text-muted-foreground text-sm">
              Please check the code and try again, or contact the event organizer.
            </p>
          </div>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { certificate } = data;
  const isValid = data.valid;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Status Header */}
        <div className="text-center">
          <div className="flex justify-center">
            {isValid ? (
              <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
                <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>
          <h1 className="text-foreground mt-4 text-3xl font-bold">
            {isValid ? "Certificate Verified" : "Certificate Revoked"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isValid
              ? "This is an authentic certificate issued by Eventifive."
              : "This certificate has been revoked and is no longer valid."}
          </p>
        </div>

        {/* Certificate Details Card */}
        <div className="bg-card border-border rounded-lg border p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <Award className="text-primary h-6 w-6" />
            <h2 className="text-foreground text-xl font-semibold">
              Certificate Details
            </h2>
          </div>

          <div className="space-y-4">
            {/* Recipient */}
            <div>
              <p className="text-muted-foreground text-sm">Recipient</p>
              <p className="text-foreground text-lg font-semibold">
                {certificate.recipientName}
              </p>
            </div>

            {/* Role */}
            <div>
              <p className="text-muted-foreground mb-1 text-sm">Role</p>
              <Badge variant={getRoleBadgeVariant(certificate.role)}>
                {getRoleLabel(certificate.role)}
              </Badge>
            </div>

            {/* Event */}
            <div>
              <p className="text-muted-foreground text-sm">Event</p>
              <p className="text-foreground font-semibold">
                {certificate.eventTitle}
              </p>
              <p className="text-muted-foreground text-sm">
                {formatEventType(certificate.eventType)}
              </p>
            </div>

            {/* Date */}
            <div>
              <p className="text-muted-foreground text-sm">Event Date</p>
              <p className="text-foreground">
                {formatDate(certificate.eventStartDate)}
                {certificate.eventStartDate !== certificate.eventEndDate &&
                  ` - ${formatDate(certificate.eventEndDate)}`}
              </p>
            </div>

            {/* Location */}
            {certificate.eventLocation && (
              <div>
                <p className="text-muted-foreground text-sm">Location</p>
                <p className="text-foreground">{certificate.eventLocation}</p>
              </div>
            )}

            {/* Session (for facilitators) */}
            {certificate.sessionTitle && (
              <div>
                <p className="text-muted-foreground text-sm">Workshop</p>
                <p className="text-foreground">{certificate.sessionTitle}</p>
              </div>
            )}

            {/* Issued Date */}
            <div>
              <p className="text-muted-foreground text-sm">Issued On</p>
              <p className="text-foreground">
                {formatDate(certificate.issuedAt)}
              </p>
            </div>

            {/* Verification Code */}
            <div>
              <p className="text-muted-foreground text-sm">Verification Code</p>
              <p className="text-primary font-mono font-semibold">{code}</p>
            </div>

            {/* Revoke Reason (if revoked) */}
            {certificate.revoked && certificate.revokeReason && (
              <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Revocation Reason
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {certificate.revokeReason}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 text-center">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
          <p className="text-muted-foreground text-xs">
            Powered by Eventifive - Event Management Platform
          </p>
        </div>
      </div>
    </div>
  );
}
