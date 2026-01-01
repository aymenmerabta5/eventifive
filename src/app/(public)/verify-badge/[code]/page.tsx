"use client";

import { use } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BadgeRole } from "@/server/db/schema";

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

const getRoleColor = (role: BadgeRole): string => {
  switch (role) {
    case "participant":
      return "bg-blue-500";
    case "speaker":
      return "bg-amber-500";
    case "reviewer":
      return "bg-emerald-500";
    case "communicator":
      return "bg-violet-500";
    default:
      return "bg-blue-500";
  }
};

const getRoleBadgeVariant = (role: BadgeRole) => {
  switch (role) {
    case "participant":
      return "default";
    case "speaker":
      return "secondary";
    case "reviewer":
      return "outline";
    case "communicator":
      return "default";
    default:
      return "default";
  }
};

const getRoleLabel = (role: BadgeRole): string => {
  switch (role) {
    case "participant":
      return "Participant";
    case "speaker":
      return "Speaker";
    case "reviewer":
      return "Reviewer";
    case "communicator":
      return "Communicator";
    default:
      return "Attendee";
  }
};

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function VerifyBadgePage({ params }: PageProps) {
  const { code } = use(params);

  const { data, isLoading, error } = useQuery({
    ...orpc.badges.verify.queryOptions({
      input: { code },
    }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="text-primary mx-auto h-16 w-16 animate-spin" />
          <h1 className="text-foreground text-2xl font-bold">
            Verifying Badge...
          </h1>
          <p className="text-muted-foreground">
            Please wait while we verify this badge.
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
              An error occurred while verifying this badge. Please try again later.
            </p>
          </div>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Badge not found
  if (!data?.badge) {
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
              Badge Not Found
            </h1>
            <p className="text-muted-foreground">
              No badge was found with the verification code:{" "}
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

  const { badge } = data;
  const isValid = data.valid;
  const roleColor = getRoleColor(badge.role);

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
            {isValid ? "Badge Verified" : "Badge Revoked"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isValid
              ? "This is an authentic badge issued by Eventifive."
              : "This badge has been revoked and is no longer valid."}
          </p>
        </div>

        {/* Badge Details Card */}
        <div className="bg-card border-border overflow-hidden rounded-lg border shadow-lg">
          {/* Color bar for role */}
          <div className={`h-2 ${roleColor}`} />

          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <BadgeCheck className="text-primary h-6 w-6" />
              <h2 className="text-foreground text-xl font-semibold">
                Badge Details
              </h2>
            </div>

            <div className="space-y-4">
              {/* Role Badge */}
              <div className="flex justify-center">
                <span
                  className={`inline-block rounded-full px-6 py-2 text-sm font-bold tracking-wider text-white ${roleColor}`}
                >
                  {getRoleLabel(badge.role).toUpperCase()}
                </span>
              </div>

              {/* Recipient */}
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Recipient</p>
                <p className="text-foreground text-2xl font-bold">
                  {badge.recipientName}
                </p>
                {badge.affiliation && (
                  <p className="text-muted-foreground text-sm italic">
                    {badge.affiliation}
                  </p>
                )}
              </div>

              <div className="border-border border-t pt-4">
                {/* Event */}
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Event</p>
                  <p className="text-foreground font-semibold">
                    {badge.eventTitle}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {formatEventType(badge.eventType)}
                  </p>
                </div>

                {/* Date */}
                <div className="mt-3 text-center">
                  <p className="text-muted-foreground text-sm">Event Date</p>
                  <p className="text-foreground">
                    {formatDate(badge.eventStartDate)}
                    {new Date(badge.eventStartDate).toDateString() !==
                      new Date(badge.eventEndDate).toDateString() &&
                      ` - ${formatDate(badge.eventEndDate)}`}
                  </p>
                </div>

                {/* Location */}
                {badge.eventLocation && (
                  <div className="mt-3 text-center">
                    <p className="text-muted-foreground text-sm">Location</p>
                    <p className="text-foreground">{badge.eventLocation}</p>
                  </div>
                )}
              </div>

              <div className="border-border border-t pt-4">
                {/* Issued Date */}
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Issued On</p>
                  <p className="text-foreground">
                    {formatDate(badge.issuedAt)}
                  </p>
                </div>

                {/* Verification Code */}
                <div className="mt-3 text-center">
                  <p className="text-muted-foreground text-sm">Verification Code</p>
                  <p className="text-primary font-mono font-semibold">{code}</p>
                </div>
              </div>

              {/* Revoke Reason (if revoked) */}
              {badge.revoked && badge.revokeReason && (
                <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Revocation Reason
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {badge.revokeReason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom color bar */}
          <div className={`h-2 ${roleColor}`} />
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
