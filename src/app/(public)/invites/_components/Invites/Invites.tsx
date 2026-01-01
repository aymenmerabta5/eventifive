"use client";

import { useInvites } from "./hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  IconLoader2,
  IconMail,
  IconMailOpened,
  IconMicrophone2,
  IconEye,
  IconUsers,
  IconCalendarEvent,
  IconExternalLink,
  IconCheck,
  IconX,
  IconHourglass,
  IconChevronDown,
  IconSparkles,
  IconInbox,
  IconAlertCircle,
  IconRefresh,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { formatDate } from "@/lib/date";
import Link from "next/link";
import type { Route } from "next";
import type { CommunicatorAssignment, SpeakerInvite, ReviewerInvite, InviteStatus } from "./types";

// ============================================================================
// Types & Helpers
// ============================================================================

const statusConfig: Record<InviteStatus, { label: string; icon: typeof IconCheck; className: string }> = {
  pending: {
    label: "Pending",
    icon: IconHourglass,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  accepted: {
    label: "Accepted",
    icon: IconCheck,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  rejected: {
    label: "Rejected",
    icon: IconX,
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
};

const roleConfig = {
  speaker: {
    label: "Speaker",
    icon: IconMicrophone2,
    className: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    accentColor: "from-violet-500 to-purple-500",
  },
  reviewer: {
    label: "Reviewer",
    icon: IconEye,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    accentColor: "from-blue-500 to-cyan-500",
  },
  communicator: {
    label: "Communicator",
    icon: IconUsers,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    accentColor: "from-emerald-500 to-green-500",
  },
};

const formatEventType = (type: string): string => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// ============================================================================
// Communicator Card Component
// ============================================================================

function CommunicatorCard({ assignment }: { assignment: CommunicatorAssignment }) {
  const role = roleConfig.communicator;
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
      <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", role.accentColor)} />

      <div className="p-5 pt-6">
        {/* Header: Role Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <Badge variant="outline" className={cn("gap-1.5 font-medium", role.className)}>
            <RoleIcon className="size-3.5" />
            {role.label}
          </Badge>
          <Badge variant="secondary" className="gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <IconCheck className="size-3" />
            Active
          </Badge>
        </div>

        {/* Event Title */}
        <div className="space-y-1 mb-4">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {assignment.eventTitle}
          </h3>
        </div>

        {/* Details */}
        <div className="flex items-center gap-2.5 text-sm">
          <div className="flex items-center justify-center size-8 rounded-lg bg-muted">
            <IconCalendarEvent className="size-4 text-muted-foreground" />
          </div>
          <span className="text-muted-foreground text-xs">
            Assigned {formatDate(assignment.assignedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Speaker Invite Card Component
// ============================================================================

function SpeakerInviteCard({
  invite,
  onAccept,
  onReject,
  isDisabled,
}: {
  invite: SpeakerInvite;
  onAccept: (eventId: string) => void;
  onReject: (eventId: string) => void;
  isDisabled: boolean;
}) {
  const role = roleConfig.speaker;
  const RoleIcon = role.icon;
  const status = statusConfig[invite.status];
  const StatusIcon = status.icon;
  const isPending = invite.status === "pending";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-300",
        "bg-gradient-to-br from-card to-card/80",
        "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        isPending && "ring-2 ring-amber-500/20 border-amber-500/30"
      )}
    >
      {/* Gradient accent at top */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
          isPending ? "from-amber-500 via-orange-500 to-amber-500" : role.accentColor
        )}
      />

      <div className="p-5 pt-6">
        {/* Header: Role & Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <Badge variant="outline" className={cn("gap-1.5 font-medium", role.className)}>
            <RoleIcon className="size-3.5" />
            {role.label}
          </Badge>
          <Badge variant="outline" className={cn("gap-1.5", status.className)}>
            <StatusIcon className="size-3" />
            {status.label}
          </Badge>
        </div>

        {/* Event Title */}
        <div className="space-y-1 mb-4">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {invite.eventTitle}
          </h3>
          {invite.eventType && (
            <p className="text-sm text-muted-foreground">
              {formatEventType(invite.eventType)}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {isPending && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onAccept(invite.eventId)}
              disabled={isDisabled}
            >
              <IconCheck className="size-4" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onReject(invite.eventId)}
              disabled={isDisabled}
            >
              <IconX className="size-4" />
              Decline
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Reviewer Invite Card Component
// ============================================================================

function ReviewerInviteCard({
  invite,
  onAccept,
  onReject,
  isDisabled,
}: {
  invite: ReviewerInvite;
  onAccept: (eventId: string) => void;
  onReject: (eventId: string) => void;
  isDisabled: boolean;
}) {
  const role = roleConfig.reviewer;
  const RoleIcon = role.icon;
  const status = statusConfig[invite.status];
  const StatusIcon = status.icon;
  const isPending = invite.status === "pending";
  const isAccepted = invite.status === "accepted";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-300",
        "bg-gradient-to-br from-card to-card/80",
        "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        isPending && "ring-2 ring-amber-500/20 border-amber-500/30"
      )}
    >
      {/* Gradient accent at top */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
          isPending ? "from-amber-500 via-orange-500 to-amber-500" : role.accentColor
        )}
      />

      <div className="p-5 pt-6">
        {/* Header: Role & Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <Badge variant="outline" className={cn("gap-1.5 font-medium", role.className)}>
            <RoleIcon className="size-3.5" />
            {role.label}
          </Badge>
          <Badge variant="outline" className={cn("gap-1.5", status.className)}>
            <StatusIcon className="size-3" />
            {status.label}
          </Badge>
        </div>

        {/* Event Title */}
        <div className="space-y-1 mb-4">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {invite.eventTitle}
          </h3>
          {invite.eventType && (
            <p className="text-sm text-muted-foreground">
              {formatEventType(invite.eventType)}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {isPending && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onAccept(invite.eventId)}
              disabled={isDisabled}
            >
              <IconCheck className="size-4" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onReject(invite.eventId)}
              disabled={isDisabled}
            >
              <IconX className="size-4" />
              Decline
            </Button>
          </div>
        )}

        {isAccepted && invite.eventType && (
          <Button size="sm" className="w-full gap-2" variant="outline" asChild>
            <Link
              href={
                `/events/${invite.eventType.replaceAll("_", "-")}/${invite.eventId}/communicator-reviews` as Route
              }
            >
              <IconExternalLink className="size-4" />
              View Submissions
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Invite Section Component
// ============================================================================

interface InviteSectionProps {
  title: string;
  count: number;
  icon: typeof IconSparkles;
  accentColor?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function InviteSection({
  title,
  count,
  icon: Icon,
  accentColor,
  defaultOpen = true,
  children,
}: InviteSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (count === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-between w-full group/trigger",
            "text-left hover:opacity-80 transition-opacity"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center size-10 rounded-xl",
                accentColor || "bg-primary/10"
              )}
            >
              <Icon className={cn("size-5", accentColor ? "text-white" : "text-primary")} />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{title}</h2>
              <p className="text-sm text-muted-foreground">
                {count} invite{count !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <IconChevronDown
            className={cn(
              "size-5 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function Invites() {
  const {
    invites,
    isEmpty,
    isPending,
    error,
    isRefetching,
    isMutating,
    handleRefresh,
    handleAcceptSpeaker,
    handleRejectSpeaker,
    handleAcceptReviewer,
    handleRejectReviewer,
  } = useInvites();

  // Group invites by status
  const groupedInvites = useMemo(() => {
    if (!invites) {
      return {
        pendingSpeaker: [],
        respondedSpeaker: [],
        pendingReviewer: [],
        respondedReviewer: [],
      };
    }

    return {
      pendingSpeaker: invites.speakerInvites.filter((i) => i.status === "pending"),
      respondedSpeaker: invites.speakerInvites.filter((i) => i.status !== "pending"),
      pendingReviewer: invites.reviewerInvites.filter((i) => i.status === "pending"),
      respondedReviewer: invites.reviewerInvites.filter((i) => i.status !== "pending"),
    };
  }, [invites]);

  const hasPendingInvites =
    groupedInvites.pendingSpeaker.length > 0 || groupedInvites.pendingReviewer.length > 0;

  // Loading state
  if (isPending) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <IconLoader2 className="size-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your invites...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-center size-20 rounded-3xl bg-destructive/10 mb-2">
          <IconAlertCircle className="size-10 text-destructive" />
        </div>
        <h3 className="text-xl font-semibold">Failed to Load Invites</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {error instanceof Error ? error.message : "An error occurred while loading your invites."}
        </p>
        <Button onClick={handleRefresh} disabled={isRefetching} className="gap-2">
          {isRefetching ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconRefresh className="size-4" />
          )}
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className="container mx-auto min-h-screen py-8 px-4">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              <IconMail className="size-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Invites</h1>
              <p className="text-muted-foreground text-sm">
                Manage your event invitations and memberships
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center size-20 rounded-3xl bg-muted/50 mb-6">
            <IconInbox className="size-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Invites Yet</h3>
          <p className="text-muted-foreground max-w-md">
            You don&apos;t have any communicator memberships or invites at the moment. When you receive
            invites, they will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen py-8 px-4">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
            <IconMailOpened className="size-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Invites</h1>
            <p className="text-muted-foreground text-sm">
              Manage your event invitations and memberships
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Pending Invites Alert */}
        {hasPendingInvites && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center justify-center size-10 rounded-lg bg-amber-500/20">
              <IconHourglass className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-amber-600 dark:text-amber-400">Pending Invites</p>
              <p className="text-sm text-muted-foreground">
                You have {groupedInvites.pendingSpeaker.length + groupedInvites.pendingReviewer.length}{" "}
                invite{groupedInvites.pendingSpeaker.length + groupedInvites.pendingReviewer.length !== 1 ? "s" : ""} waiting for your response
              </p>
            </div>
          </div>
        )}

        {/* Pending Speaker Invites */}
        {groupedInvites.pendingSpeaker.length > 0 && (
          <InviteSection
            title="Speaker Invites"
            count={groupedInvites.pendingSpeaker.length}
            icon={IconMicrophone2}
            accentColor="bg-gradient-to-br from-violet-500 to-purple-500"
            defaultOpen={true}
          >
            {groupedInvites.pendingSpeaker.map((invite) => (
              <SpeakerInviteCard
                key={`speaker-pending-${invite.id}`}
                invite={invite}
                onAccept={handleAcceptSpeaker}
                onReject={handleRejectSpeaker}
                isDisabled={isMutating}
              />
            ))}
          </InviteSection>
        )}

        {/* Pending Reviewer Invites */}
        {groupedInvites.pendingReviewer.length > 0 && (
          <InviteSection
            title="Reviewer Invites"
            count={groupedInvites.pendingReviewer.length}
            icon={IconEye}
            accentColor="bg-gradient-to-br from-blue-500 to-cyan-500"
            defaultOpen={true}
          >
            {groupedInvites.pendingReviewer.map((invite) => (
              <ReviewerInviteCard
                key={`reviewer-pending-${invite.id}`}
                invite={invite}
                onAccept={handleAcceptReviewer}
                onReject={handleRejectReviewer}
                isDisabled={isMutating}
              />
            ))}
          </InviteSection>
        )}

        {/* Communicator Memberships */}
        {invites && invites.communicatorAssignments.length > 0 && (
          <InviteSection
            title="Communicator Memberships"
            count={invites.communicatorAssignments.length}
            icon={IconUsers}
            accentColor="bg-gradient-to-br from-emerald-500 to-green-500"
            defaultOpen={true}
          >
            {invites.communicatorAssignments.map((assignment) => (
              <CommunicatorCard key={`communicator-${assignment.id}`} assignment={assignment} />
            ))}
          </InviteSection>
        )}

        {/* Responded Speaker Invites */}
        {groupedInvites.respondedSpeaker.length > 0 && (
          <InviteSection
            title="Past Speaker Invites"
            count={groupedInvites.respondedSpeaker.length}
            icon={IconMicrophone2}
            defaultOpen={false}
          >
            {groupedInvites.respondedSpeaker.map((invite) => (
              <SpeakerInviteCard
                key={`speaker-responded-${invite.id}`}
                invite={invite}
                onAccept={handleAcceptSpeaker}
                onReject={handleRejectSpeaker}
                isDisabled={isMutating}
              />
            ))}
          </InviteSection>
        )}

        {/* Responded Reviewer Invites */}
        {groupedInvites.respondedReviewer.length > 0 && (
          <InviteSection
            title="Past Reviewer Invites"
            count={groupedInvites.respondedReviewer.length}
            icon={IconEye}
            defaultOpen={false}
          >
            {groupedInvites.respondedReviewer.map((invite) => (
              <ReviewerInviteCard
                key={`reviewer-responded-${invite.id}`}
                invite={invite}
                onAccept={handleAcceptReviewer}
                onReject={handleRejectReviewer}
                isDisabled={isMutating}
              />
            ))}
          </InviteSection>
        )}
      </div>
    </div>
  );
}
