"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  IconCalendarEvent,
  IconMapPin,
  IconClock,
  IconMessageCircle,
  IconChartBar,
  IconQrcode,
  IconDownload,
  IconMicrophone2,
  IconUserStar,
  IconUsers,
  IconChevronDown,
  IconSparkles,
  IconCalendarOff,
  IconLivePhoto,
  IconCalendarTime,
} from "@tabler/icons-react";
import { useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { formatDate, formatTime } from "@/lib/date";
import type { MySessionRole } from "@/lib/schemas/sessions";
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";

// ============================================================================
// Types & Helpers
// ============================================================================

type SessionStatus = "live" | "upcoming" | "ended";

interface SessionData {
  id: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date;
  qaEnabled: boolean;
  eventId: string;
  eventTitle: string;
  room: { id: number; name: string; location: string | null } | null;
  role: MySessionRole;
  qaUrl: string;
}

function getSessionStatus(startAt: Date, endAt: Date): SessionStatus {
  const now = new Date();
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (now >= start && now <= end) return "live";
  if (now < start) return "upcoming";
  return "ended";
}

const roleConfig: Record<
  MySessionRole,
  { label: string; icon: typeof IconUserStar; className: string }
> = {
  chair: {
    label: "Session Chair",
    icon: IconUserStar,
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
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
};

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
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-16 w-24 rounded-xl" />
              <Skeleton className="h-16 w-28 rounded-xl" />
              <Skeleton className="h-16 w-24 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Section header skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-border/50 bg-card rounded-2xl border p-5 pt-6"
              >
                <div className="mb-4 flex justify-between">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="mb-4 space-y-1">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="mb-5 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-md" />
                  <Skeleton className="h-9 flex-1 rounded-md" />
                  <Skeleton className="h-9 w-10 rounded-md" />
                </div>
              </div>
            ))}
          </div>
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
  icon: typeof IconSparkles;
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
// Session Card Component
// ============================================================================

function MySessionCard({ session }: { session: SessionData }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const status = getSessionStatus(session.startAt, session.endAt);
  const role = roleConfig[session.role];
  const RoleIcon = role.icon;

  const pollsUrl = `/events/${session.eventId}/sessions/${session.id}/polls`;

  const handleDownloadQRCode = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `session-qa-${session.id.slice(0, 8)}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success("QR Code downloaded successfully");
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-300",
        "from-card to-card/80 bg-gradient-to-br",
        "hover:shadow-primary/5 hover:-translate-y-0.5 hover:shadow-lg",
        status === "live" && "border-red-500/30 ring-2 ring-red-500/30",
      )}
    >
      {/* Status indicator line at top */}
      <div
        className={cn(
          "absolute top-0 right-0 left-0 h-1",
          status === "live" &&
            "animate-pulse bg-gradient-to-r from-red-500 via-orange-500 to-red-500",
          status === "upcoming" &&
            "from-primary/60 to-primary bg-gradient-to-r",
          status === "ended" && "bg-muted",
        )}
      />

      <div className="p-5 pt-6">
        {/* Header: Role & Status */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <Badge
            variant="outline"
            className={cn("gap-1.5 font-medium", role.className)}
          >
            <RoleIcon className="size-3.5" />
            {role.label}
          </Badge>

          {status === "live" ? (
            <Badge variant="destructive" className="animate-pulse gap-1.5">
              <span className="size-1.5 animate-ping rounded-full bg-white" />
              Live Now
            </Badge>
          ) : status === "upcoming" ? (
            <Badge variant="secondary" className="gap-1.5">
              <IconSparkles className="size-3" />
              Upcoming
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Ended
            </Badge>
          )}
        </div>

        {/* Session Title & Event */}
        <div className="mb-4 space-y-1">
          <h3 className="group-hover:text-primary line-clamp-2 text-lg leading-tight font-semibold transition-colors">
            {session.title}
          </h3>
          <p className="text-muted-foreground line-clamp-1 text-sm">
            {session.eventTitle}
          </p>
        </div>

        {/* Session Details */}
        <div className="mb-5 space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm">
            <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
              <IconCalendarEvent className="text-primary size-4" />
            </div>
            <span className="text-muted-foreground">
              {formatDate(session.startAt)}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-sm">
            <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
              <IconClock className="text-primary size-4" />
            </div>
            <span className="text-muted-foreground">
              {formatTime(session.startAt)} – {formatTime(session.endAt)}
            </span>
          </div>

          {session.room && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                <IconMapPin className="text-primary size-4" />
              </div>
              <span className="text-muted-foreground line-clamp-1">
                {session.room.name}
                {session.room.location && ` · ${session.room.location}`}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Q&A Button */}
          <Button
            size="sm"
            variant={session.qaEnabled ? "default" : "outline"}
            className="flex-1 gap-2"
            disabled={!session.qaEnabled}
            asChild={session.qaEnabled}
          >
            {session.qaEnabled ? (
              <Link href={session.qaUrl as Route}>
                <IconMessageCircle className="size-4" />
                Q&A
              </Link>
            ) : (
              <span>
                <IconMessageCircle className="size-4" />
                Q&A Off
              </span>
            )}
          </Button>

          {/* Polls Button */}
          <Button size="sm" variant="outline" className="flex-1 gap-2" asChild>
            <Link href={pollsUrl as Route}>
              <IconChartBar className="size-4" />
              Polls
            </Link>
          </Button>

          {/* QR Code Popover */}
          {session.qaEnabled && (
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="px-2.5">
                  <IconQrcode className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="end">
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-sm font-medium">Q&A QR Code</p>
                    <p className="text-muted-foreground text-xs">
                      Share with attendees
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-3 shadow-inner">
                    <QRCodeSVG
                      value={session.qaUrl}
                      size={140}
                      level="H"
                      includeMargin={false}
                      ref={svgRef}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleDownloadQRCode}
                  >
                    <IconDownload className="size-4" />
                    Download PNG
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Session Group Component
// ============================================================================

interface SessionGroupProps {
  title: string;
  sessions: SessionData[];
  icon: typeof IconSparkles;
  defaultOpen?: boolean;
  accentColor?: string;
}

function SessionGroup({
  title,
  sessions,
  icon: Icon,
  defaultOpen = true,
  accentColor,
}: SessionGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (sessions.length === 0) return null;

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
                "flex size-10 items-center justify-center rounded-xl",
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
                {sessions.length} session{sessions.length !== 1 ? "s" : ""}
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
          {sessions.map((session) => (
            <MySessionCard key={session.id} session={session} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function MySessionsPage() {
  const { data: authSession, isPending: isSessionPending } =
    authClient.useSession();

  const { data, isLoading } = useQuery({
    ...orpc.sessions.mySessions.queryOptions({}),
    enabled: !!authSession,
  });

  // Group sessions by status
  const { liveSessions, upcomingSessions, pastSessions } = useMemo(() => {
    if (!data?.sessions) {
      return { liveSessions: [], upcomingSessions: [], pastSessions: [] };
    }

    const live: SessionData[] = [];
    const upcoming: SessionData[] = [];
    const past: SessionData[] = [];

    for (const session of data.sessions) {
      const sessionWithDates = {
        ...session,
        startAt: new Date(session.startAt),
        endAt: new Date(session.endAt),
      };

      const status = getSessionStatus(
        sessionWithDates.startAt,
        sessionWithDates.endAt,
      );

      if (status === "live") {
        live.push(sessionWithDates);
      } else if (status === "upcoming") {
        upcoming.push(sessionWithDates);
      } else {
        past.push(sessionWithDates);
      }
    }

    // Sort live/upcoming by startAt ascending, past by startAt descending
    live.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    upcoming.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    past.sort((a, b) => b.startAt.getTime() - a.startAt.getTime());

    return {
      liveSessions: live,
      upcomingSessions: upcoming,
      pastSessions: past,
    };
  }, [data?.sessions]);

  // Loading states
  if (isSessionPending || isLoading) {
    return <LoadingSkeleton />;
  }

  // Auth required
  if (!authSession) {
    redirect("/login");
  }

  const totalSessions = data?.sessions?.length ?? 0;
  const hasAnySessions = totalSessions > 0;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="border-border/40 bg-card/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="from-primary to-primary/70 shadow-primary/20 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg">
                <IconMicrophone2 className="size-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  My Sessions
                </h1>
                <p className="text-muted-foreground">
                  Sessions where you&apos;re a chair, speaker, or communicator
                </p>
              </div>
            </div>

            {/* Stats */}
            {hasAnySessions && (
              <div className="flex flex-wrap gap-3">
                <StatCard
                  label="Live"
                  value={liveSessions.length}
                  icon={IconLivePhoto}
                  color="text-red-500"
                  bgColor="bg-red-500/10"
                />
                <StatCard
                  label="Upcoming"
                  value={upcomingSessions.length}
                  icon={IconCalendarTime}
                  color="text-primary"
                  bgColor="bg-primary/10"
                />
                <StatCard
                  label="Total"
                  value={totalSessions}
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
        {!hasAnySessions ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <div className="bg-primary/10 absolute inset-0 scale-150 rounded-full blur-2xl" />
              <div className="border-border/50 bg-card relative flex size-24 items-center justify-center rounded-3xl border">
                <IconCalendarOff className="text-muted-foreground size-12" />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold">No Sessions Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              You haven&apos;t been assigned to any sessions as a chair,
              speaker, or communicator yet.
            </p>
            <Button asChild className="gap-2 rounded-full px-6">
              <Link href="/events">
                <IconCalendarEvent className="size-4" />
                Browse Events
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Live Sessions */}
            <SessionGroup
              title="Live Now"
              sessions={liveSessions}
              icon={IconSparkles}
              accentColor="bg-gradient-to-br from-red-500 to-orange-500"
              defaultOpen={true}
            />

            {/* Upcoming Sessions */}
            <SessionGroup
              title="Upcoming"
              sessions={upcomingSessions}
              icon={IconCalendarEvent}
              defaultOpen={true}
            />

            {/* Past Sessions */}
            <SessionGroup
              title="Past Sessions"
              sessions={pastSessions}
              icon={IconClock}
              defaultOpen={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
