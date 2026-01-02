"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconFileText,
  IconCalendarEvent,
  IconExternalLink,
  IconChevronDown,
  IconFileOff,
  IconCheck,
  IconHourglass,
  IconX,
  IconPresentation,
  IconMessageCircle,
  IconClipboardList,
  IconSparkles,
} from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

// ============================================================================
// Types & Helpers
// ============================================================================

const statusConfig = {
  draft: {
    label: "Draft",
    icon: IconHourglass,
    className:
      "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  },
  pending: {
    label: "Pending Review",
    icon: IconHourglass,
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  accepted: {
    label: "Accepted",
    icon: IconCheck,
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  rejected: {
    label: "Not Accepted",
    icon: IconX,
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
};

const formatSubmissionType = (type: string): string => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

interface SubmissionApplication {
  id: string;
  type: "submission";
  title: string;
  abstract: string | null;
  submissionType: "oral" | "poster" | "displayed_paper";
  status: "draft" | "accepted" | "rejected";
  submittedAt: Date | null;
  updatedAt: Date;
  event: {
    id: string;
    title: string;
    type: string;
    startDate: Date;
    endDate: Date;
  };
  reviewerFeedback:
    | {
        recommendation: "accept" | "reject" | null;
        comment: string | null;
      }[]
    | null;
}

interface WorkshopApplication {
  id: string;
  type: "workshop";
  title: string;
  description: string | null;
  researchDomain: string | null;
  status: "pending" | "accepted" | "rejected";
  proposedAt: Date;
  respondedAt: Date | null;
  rejectionReason: string | null;
  event: {
    id: string;
    title: string;
    type: string;
    startDate: Date;
    endDate: Date;
  };
}

type Application = SubmissionApplication | WorkshopApplication;

// ============================================================================
// Loading Skeleton
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <div className="border-border/40 bg-card/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="size-14 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-28 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {[1, 2].map((section) => (
            <div key={section} className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((card) => (
                  <div
                    key={card}
                    className="border-border/50 bg-card rounded-2xl border p-5"
                  >
                    <div className="mb-4 flex justify-between">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="mb-2 h-6 w-full" />
                    <Skeleton className="mb-4 h-4 w-3/4" />
                    <div className="mb-4 flex items-center gap-2.5">
                      <Skeleton className="size-8 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Submission Card Component
// ============================================================================

function SubmissionCard({
  application,
}: {
  application: SubmissionApplication;
}) {
  const statusInfo = statusConfig[application.status];
  const StatusIcon = statusInfo.icon;
  const [showFeedback, setShowFeedback] = useState(false);
  const hasFeedback =
    application.reviewerFeedback && application.reviewerFeedback.length > 0;

  return (
    <div
      className={cn(
        "group border-border/50 relative overflow-hidden rounded-2xl border transition-all duration-300",
        "bg-card hover:border-border",
        "hover:shadow-primary/5 hover:-translate-y-0.5 hover:shadow-lg",
        application.status === "accepted" &&
          "border-emerald-500/30 ring-2 ring-emerald-500/20",
      )}
    >
      {/* Status indicator line */}
      <div
        className={cn(
          "absolute top-0 right-0 left-0 h-1",
          application.status === "accepted" &&
            "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500",
          application.status === "rejected" &&
            "bg-gradient-to-r from-red-500 via-red-400 to-red-500",
          application.status === "draft" && "bg-muted",
        )}
      />

      <div className="p-5 pt-6">
        {/* Header: Status & Type */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <Badge
            variant="outline"
            className={cn("gap-1.5 font-medium", statusInfo.className)}
          >
            <StatusIcon className="size-3.5" />
            {statusInfo.label}
          </Badge>
          <Badge variant="secondary" className="gap-1 text-xs">
            <IconFileText className="size-3" />
            {formatSubmissionType(application.submissionType)}
          </Badge>
        </div>

        {/* Application Title & Abstract */}
        <div className="mb-4 space-y-1">
          <h3 className="group-hover:text-primary line-clamp-2 text-lg leading-tight font-semibold transition-colors">
            {application.title}
          </h3>
          {application.abstract && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {application.abstract}
            </p>
          )}
        </div>

        {/* Event Info */}
        <div className="mb-5 space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm">
            <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
              <IconCalendarEvent className="text-primary size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{application.event.title}</p>
              <p className="text-muted-foreground text-xs">
                {formatDate(application.event.startDate)} –{" "}
                {formatDate(application.event.endDate)}
              </p>
            </div>
          </div>

          {application.submittedAt && (
            <p className="text-muted-foreground pl-10 text-xs">
              Submitted {formatDate(application.submittedAt)}
            </p>
          )}
        </div>

        {/* Reviewer Feedback */}
        {hasFeedback && (
          <div className="mb-4">
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className="text-primary flex items-center gap-2 text-sm hover:underline"
            >
              <IconMessageCircle className="size-4" />
              {showFeedback ? "Hide" : "Show"} Reviewer Feedback (
              {application.reviewerFeedback?.length})
              <IconChevronDown
                className={cn(
                  "size-4 transition-transform",
                  showFeedback && "rotate-180",
                )}
              />
            </button>

            {showFeedback && (
              <div className="mt-3 space-y-2">
                {application.reviewerFeedback?.map((feedback, index) => (
                  <div
                    key={index}
                    className="bg-muted/50 border-border/50 rounded-xl border p-3 text-sm"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-medium">Reviewer {index + 1}</span>
                      {feedback.recommendation && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            feedback.recommendation === "accept"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                              : "border-red-500/20 bg-red-500/10 text-red-600",
                          )}
                        >
                          {feedback.recommendation === "accept"
                            ? "Accept"
                            : "Reject"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {feedback.comment || "No comment provided."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button
          size="sm"
          variant="outline"
          className="group-hover:bg-primary group-hover:text-primary-foreground w-full gap-2 transition-all group-hover:border-transparent"
          asChild
        >
          <Link href={`/events/${application.event.id}` as Route}>
            <IconExternalLink className="size-4" />
            View Event
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Workshop Card Component
// ============================================================================

function WorkshopCard({ application }: { application: WorkshopApplication }) {
  const statusInfo = statusConfig[application.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div
      className={cn(
        "group border-border/50 relative overflow-hidden rounded-2xl border transition-all duration-300",
        "bg-card hover:border-border",
        "hover:shadow-primary/5 hover:-translate-y-0.5 hover:shadow-lg",
        application.status === "accepted" &&
          "border-emerald-500/30 ring-2 ring-emerald-500/20",
      )}
    >
      {/* Status indicator line */}
      <div
        className={cn(
          "absolute top-0 right-0 left-0 h-1",
          application.status === "accepted" &&
            "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500",
          application.status === "rejected" &&
            "bg-gradient-to-r from-red-500 via-red-400 to-red-500",
          application.status === "pending" &&
            "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500",
        )}
      />

      <div className="p-5 pt-6">
        {/* Header: Status & Type */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <Badge
            variant="outline"
            className={cn("gap-1.5 font-medium", statusInfo.className)}
          >
            <StatusIcon className="size-3.5" />
            {statusInfo.label}
          </Badge>
          <Badge variant="secondary" className="gap-1 text-xs">
            <IconPresentation className="size-3" />
            Workshop
          </Badge>
        </div>

        {/* Application Title & Description */}
        <div className="mb-4 space-y-1">
          <h3 className="group-hover:text-primary line-clamp-2 text-lg leading-tight font-semibold transition-colors">
            {application.title}
          </h3>
          {application.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {application.description}
            </p>
          )}
          {application.researchDomain && (
            <p className="text-muted-foreground text-xs">
              Domain: {application.researchDomain}
            </p>
          )}
        </div>

        {/* Event Info */}
        <div className="mb-5 space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm">
            <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
              <IconCalendarEvent className="text-primary size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{application.event.title}</p>
              <p className="text-muted-foreground text-xs">
                {formatDate(application.event.startDate)} –{" "}
                {formatDate(application.event.endDate)}
              </p>
            </div>
          </div>

          <p className="text-muted-foreground pl-10 text-xs">
            Proposed {formatDate(application.proposedAt)}
          </p>
        </div>

        {/* Rejection Reason */}
        {application.status === "rejected" && application.rejectionReason && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm">
            <p className="text-red-600 dark:text-red-400">
              {application.rejectionReason}
            </p>
          </div>
        )}

        {/* Action Button */}
        <Button
          size="sm"
          variant="outline"
          className="group-hover:bg-primary group-hover:text-primary-foreground w-full gap-2 transition-all group-hover:border-transparent"
          asChild
        >
          <Link href={`/events/${application.event.id}` as Route}>
            <IconExternalLink className="size-4" />
            View Event
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Application Group Component
// ============================================================================

interface ApplicationGroupProps {
  title: string;
  applications: Application[];
  icon: typeof IconFileText;
  defaultOpen?: boolean;
  accentColor?: string;
}

function ApplicationGroup({
  title,
  applications,
  icon: Icon,
  defaultOpen = true,
  accentColor,
}: ApplicationGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (applications.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "group/trigger flex w-full items-center justify-between",
            "text-left transition-opacity hover:opacity-80",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-xl shadow-lg",
                accentColor || "bg-primary/10",
              )}
            >
              <Icon
                className={cn(
                  "size-5",
                  accentColor ? "text-white" : "text-primary",
                )}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-muted-foreground text-sm">
                {applications.length} application
                {applications.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <IconChevronDown
            className={cn(
              "text-muted-foreground size-5 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) =>
            application.type === "submission" ? (
              <SubmissionCard key={application.id} application={application} />
            ) : (
              <WorkshopCard key={application.id} application={application} />
            ),
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// Stats Card Component
// ============================================================================

interface StatCardProps {
  label: string;
  value: number;
  icon: typeof IconCheck;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <div
      className={cn(
        "border-border/50 bg-card/80 flex items-center gap-3 rounded-xl border px-4 py-3 backdrop-blur-sm",
      )}
    >
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
// Main Page Component
// ============================================================================

export default function MyApplicationsPage() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const { data, isLoading } = useQuery({
    ...orpc.applications.listMine.queryOptions(),
    enabled: !!session,
  });

  // Group applications by status
  const { acceptedApplications, pendingApplications, rejectedApplications } =
    useMemo(() => {
      if (!data) {
        return {
          acceptedApplications: [],
          pendingApplications: [],
          rejectedApplications: [],
        };
      }

      const accepted: Application[] = [];
      const pending: Application[] = [];
      const rejected: Application[] = [];

      // Process submissions
      for (const sub of data.submissions) {
        const submission: SubmissionApplication = {
          ...sub,
          type: "submission",
          submittedAt: sub.submittedAt ? new Date(sub.submittedAt) : null,
          updatedAt: new Date(sub.updatedAt),
          event: {
            ...sub.event,
            startDate: new Date(sub.event.startDate),
            endDate: new Date(sub.event.endDate),
          },
        };

        if (submission.status === "accepted") {
          accepted.push(submission);
        } else if (submission.status === "rejected") {
          rejected.push(submission);
        } else {
          pending.push(submission);
        }
      }

      // Process workshops
      for (const ws of data.workshops) {
        const workshop: WorkshopApplication = {
          ...ws,
          type: "workshop",
          proposedAt: new Date(ws.proposedAt),
          respondedAt: ws.respondedAt ? new Date(ws.respondedAt) : null,
          event: {
            ...ws.event,
            startDate: new Date(ws.event.startDate),
            endDate: new Date(ws.event.endDate),
          },
        };

        if (workshop.status === "accepted") {
          accepted.push(workshop);
        } else if (workshop.status === "rejected") {
          rejected.push(workshop);
        } else {
          pending.push(workshop);
        }
      }

      return {
        acceptedApplications: accepted,
        pendingApplications: pending,
        rejectedApplications: rejected,
      };
    }, [data]);

  // Loading state
  if (isSessionPending || isLoading) {
    return <LoadingSkeleton />;
  }

  // Auth required
  if (!session) {
    redirect("/login");
  }

  const totalApplications =
    (data?.submissions?.length ?? 0) + (data?.workshops?.length ?? 0);
  const hasAnyApplications = totalApplications > 0;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="border-border/40 bg-card/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="from-primary to-primary/70 shadow-primary/20 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg">
                <IconClipboardList className="text-primary-foreground size-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  My Applications
                </h1>
                <p className="text-muted-foreground">
                  Track your submissions and workshop proposals
                </p>
              </div>
            </div>

            {/* Stats */}
            {hasAnyApplications && (
              <div className="flex flex-wrap gap-3">
                <StatCard
                  label="Accepted"
                  value={acceptedApplications.length}
                  icon={IconCheck}
                  color="text-emerald-500"
                  bgColor="bg-emerald-500/10"
                />
                <StatCard
                  label="Pending"
                  value={pendingApplications.length}
                  icon={IconHourglass}
                  color="text-amber-500"
                  bgColor="bg-amber-500/10"
                />
                <StatCard
                  label="Total"
                  value={totalApplications}
                  icon={IconSparkles}
                  color="text-primary"
                  bgColor="bg-primary/10"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {!hasAnyApplications ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <div className="bg-primary/10 absolute inset-0 scale-150 rounded-full blur-2xl" />
              <div className="border-border/50 bg-card relative flex size-24 items-center justify-center rounded-3xl border">
                <IconFileOff className="text-muted-foreground size-12" />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold">No Applications Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              You haven&apos;t submitted any communicator papers or workshop
              proposals yet. Browse events to find opportunities!
            </p>
            <Button asChild className="gap-2 rounded-full px-6">
              <Link href="/events">
                <IconCalendarEvent className="size-4" />
                Browse Events
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Accepted Applications */}
            <ApplicationGroup
              title="Accepted"
              applications={acceptedApplications}
              icon={IconCheck}
              accentColor="bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/25"
              defaultOpen={true}
            />

            {/* Pending Applications */}
            <ApplicationGroup
              title="Pending Review"
              applications={pendingApplications}
              icon={IconHourglass}
              accentColor="bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/25"
              defaultOpen={true}
            />

            {/* Rejected Applications */}
            <ApplicationGroup
              title="Not Accepted"
              applications={rejectedApplications}
              icon={IconX}
              accentColor="bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/25"
              defaultOpen={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
