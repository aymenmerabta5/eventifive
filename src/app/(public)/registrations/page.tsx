"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  IconLoader2,
  IconTicket,
  IconCalendarEvent,
  IconMapPin,
  IconExternalLink,
  IconClock,
  IconSparkles,
  IconChevronDown,
  IconCalendarOff,
  IconCheck,
  IconHourglass,
  IconX,
  IconRefresh,
  IconId,
  IconLivePhoto,
  IconCalendarTime,
  IconPresentation,
  IconUser,
  IconFileDescription,
} from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { BadgeTemplate } from "@/lib/badges/BadgeTemplate";
import { generateBadgeQRCodeDataUrl } from "@/lib/badges/generateQRCode";
import type { MyBadge } from "@/lib/schemas/badges";

// ============================================================================
// Types & Helpers
// ============================================================================

type EventStatus = "live" | "upcoming" | "ended";

const paymentConfig: Record<
  string,
  { label: string; icon: typeof IconCheck; className: string }
> = {
  paid: {
    label: "Paid",
    icon: IconCheck,
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  pending: {
    label: "Pending",
    icon: IconHourglass,
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  unpaid: {
    label: "Unpaid",
    icon: IconX,
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
  refunded: {
    label: "Refunded",
    icon: IconRefresh,
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
};

const formatEventType = (type: string): string => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

function getEventStatus(startDate: Date, endDate: Date): EventStatus {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now >= start && now <= end) return "live";
  if (now < start) return "upcoming";
  return "ended";
}

interface Registration {
  id: number;
  eventId: string;
  paymentStatus: string;
  roleAtEvent: string;
  registeredAt: Date;
  event: {
    title: string;
    type: string;
    startDate: Date;
    endDate: Date;
    location: string | null;
    smallDescription: string | null;
    imageUrl: string | null;
  };
  badge?: MyBadge | null;
}

interface WorkshopRegistration {
  id: number;
  workshopId: string;
  registeredAt: Date;
  status: string;
  workshop: {
    id: string;
    title: string;
    description: string | null;
    capacity: number | null;
    startAt: Date | null;
    endAt: Date | null;
    facilitator: {
      id: string;
      name: string;
      image: string | null;
    };
  };
  event: {
    id: string;
    title: string;
    type: string;
    startDate: Date;
    endDate: Date;
    location: string | null;
    imageUrl: string | null;
  };
}

type WorkshopStatus = "live" | "upcoming" | "ended" | "unscheduled";

function getWorkshopStatus(
  startAt: Date | null,
  endAt: Date | null,
): WorkshopStatus {
  if (!startAt || !endAt) return "unscheduled";
  const now = new Date();
  if (now >= startAt && now <= endAt) return "live";
  if (now < startAt) return "upcoming";
  return "ended";
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
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
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
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-border/50 bg-card overflow-hidden rounded-2xl border"
              >
                <Skeleton className="h-32 w-full" />
                <div className="p-5">
                  <div className="mb-4 flex justify-between">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <div className="mb-4 space-y-1">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                  <div className="mb-5 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="size-8 rounded-lg" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="size-8 rounded-lg" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1 rounded-md" />
                    <Skeleton className="h-9 w-20 rounded-md" />
                  </div>
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
// Registration Card Component
// ============================================================================

function RegistrationCard({ registration }: { registration: Registration }) {
  const status = getEventStatus(
    registration.event.startDate,
    registration.event.endDate,
  );
  const payment =
    paymentConfig[registration.paymentStatus] ?? paymentConfig.pending!;
  const PaymentIcon = payment.icon;
  const isLive = status === "live";
  const [isDownloadingBadge, setIsDownloadingBadge] = useState(false);

  const handleDownloadBadge = async () => {
    if (!registration.badge) return;

    setIsDownloadingBadge(true);
    try {
      const baseUrl = window.location.origin;

      // Get full badge data including user info from the download endpoint
      const badgeData = await orpc.badges.download.call({
        badgeId: registration.badge.id,
      });

      const qrCodeDataUrl = await generateBadgeQRCodeDataUrl(
        badgeData.verificationCode,
        baseUrl,
      );

      const doc = (
        <BadgeTemplate
          recipientName={badgeData.recipientName}
          recipientEmail={badgeData.recipientEmail}
          eventTitle={badgeData.eventTitle}
          eventType={badgeData.eventType}
          eventStartDate={new Date(badgeData.eventStartDate)}
          eventEndDate={new Date(badgeData.eventEndDate)}
          eventLocation={badgeData.eventLocation}
          role={badgeData.role}
          affiliation={badgeData.affiliation}
          verificationCode={badgeData.verificationCode}
          issuedAt={new Date(badgeData.issuedAt)}
          qrCodeDataUrl={qrCodeDataUrl}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `badge-${registration.badge.verificationCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Badge downloaded successfully!");
    } catch (error) {
      console.error("Failed to download badge:", error);
      toast.error("Failed to download badge. Please try again.");
    } finally {
      setIsDownloadingBadge(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-300",
        "from-card to-card/80 bg-gradient-to-br",
        "hover:shadow-primary/5 hover:-translate-y-0.5 hover:shadow-lg",
        isLive && "border-emerald-500/30 ring-2 ring-emerald-500/30",
      )}
    >
      {/* Event Image */}
      {registration.event.imageUrl && (
        <div className="relative h-32 w-full overflow-hidden">
          <img
            src={registration.event.imageUrl}
            alt={registration.event.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="from-card/90 absolute inset-0 bg-gradient-to-t to-transparent" />

          {/* Status badge on image */}
          <div className="absolute top-3 left-3">
            {status === "live" ? (
              <Badge
                variant="default"
                className="gap-1.5 bg-emerald-500 hover:bg-emerald-500"
              >
                <span className="size-1.5 animate-ping rounded-full bg-white" />
                Live Now
              </Badge>
            ) : status === "upcoming" ? (
              <Badge variant="secondary" className="gap-1.5">
                <IconSparkles className="size-3" />
                Upcoming
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-background/80 text-muted-foreground backdrop-blur-sm"
              >
                Ended
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Status indicator line if no image */}
      {!registration.event.imageUrl && (
        <div
          className={cn(
            "absolute top-0 right-0 left-0 h-1",
            status === "live" &&
              "animate-pulse bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500",
            status === "upcoming" &&
              "from-primary/60 to-primary bg-gradient-to-r",
            status === "ended" && "bg-muted",
          )}
        />
      )}

      <div className={cn("p-5", !registration.event.imageUrl && "pt-6")}>
        {/* Header: Payment & Event Type */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <Badge
            variant="outline"
            className={cn("gap-1.5 font-medium", payment.className)}
          >
            <PaymentIcon className="size-3.5" />
            {payment.label}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {formatEventType(registration.event.type)}
          </Badge>
        </div>

        {/* Event Title & Description */}
        <div className="mb-4 space-y-1">
          <h3 className="group-hover:text-primary line-clamp-2 text-lg leading-tight font-semibold transition-colors">
            {registration.event.title}
          </h3>
          {registration.event.smallDescription && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {registration.event.smallDescription}
            </p>
          )}
        </div>

        {/* Event Details */}
        <div className="mb-5 space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm">
            <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
              <IconCalendarEvent className="text-primary size-4" />
            </div>
            <span className="text-muted-foreground">
              {formatDate(registration.event.startDate)} –{" "}
              {formatDate(registration.event.endDate)}
            </span>
          </div>

          {registration.event.location && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                <IconMapPin className="text-primary size-4" />
              </div>
              <span className="text-muted-foreground line-clamp-1">
                {registration.event.location}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-sm">
            <div className="bg-muted flex size-8 items-center justify-center rounded-lg">
              <IconClock className="text-muted-foreground size-4" />
            </div>
            <span className="text-muted-foreground text-xs">
              Registered {formatDate(registration.registeredAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 gap-2" asChild>
            <Link href={`/events/${registration.eventId}` as Route}>
              <IconExternalLink className="size-4" />
              View Event
            </Link>
          </Button>
          {registration.badge && registration.paymentStatus === "paid" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={handleDownloadBadge}
              disabled={isDownloadingBadge}
            >
              {isDownloadingBadge ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconId className="size-4" />
              )}
              Badge
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Registration Group Component
// ============================================================================

interface RegistrationGroupProps {
  title: string;
  registrations: Registration[];
  icon: typeof IconSparkles;
  defaultOpen?: boolean;
  accentColor?: string;
}

function RegistrationGroup({
  title,
  registrations,
  icon: Icon,
  defaultOpen = true,
  accentColor,
}: RegistrationGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (registrations.length === 0) return null;

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
                {registrations.length} event
                {registrations.length !== 1 ? "s" : ""}
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
          {registrations.map((registration) => (
            <RegistrationCard
              key={registration.id}
              registration={registration}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// Workshop Registration Card Component
// ============================================================================

function WorkshopRegistrationCard({
  registration,
}: {
  registration: WorkshopRegistration;
}) {
  const status = getWorkshopStatus(
    registration.workshop.startAt,
    registration.workshop.endAt,
  );
  const isLive = status === "live";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-300",
        "from-card to-card/80 bg-gradient-to-br",
        "hover:shadow-primary/5 hover:-translate-y-0.5 hover:shadow-lg",
        isLive && "border-emerald-500/30 ring-2 ring-emerald-500/30",
      )}
    >
      {/* Event Image */}
      {registration.event.imageUrl && (
        <div className="relative h-32 w-full overflow-hidden">
          <img
            src={registration.event.imageUrl}
            alt={registration.event.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="from-card/90 absolute inset-0 bg-gradient-to-t to-transparent" />

          {/* Status badge on image */}
          <div className="absolute top-3 left-3">
            {status === "live" ? (
              <Badge
                variant="default"
                className="gap-1.5 bg-emerald-500 hover:bg-emerald-500"
              >
                <span className="size-1.5 animate-ping rounded-full bg-white" />
                Live Now
              </Badge>
            ) : status === "upcoming" ? (
              <Badge variant="secondary" className="gap-1.5">
                <IconSparkles className="size-3" />
                Upcoming
              </Badge>
            ) : status === "unscheduled" ? (
              <Badge variant="secondary" className="gap-1.5">
                TBA
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-background/80 text-muted-foreground backdrop-blur-sm"
              >
                Ended
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Status indicator line if no image */}
      {!registration.event.imageUrl && (
        <div
          className={cn(
            "absolute top-0 right-0 left-0 h-1",
            status === "live" &&
              "animate-pulse bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500",
            status === "upcoming" &&
              "from-primary/60 to-primary bg-gradient-to-r",
            status === "ended" && "bg-muted",
          )}
        />
      )}

      <div className={cn("p-5", !registration.event.imageUrl && "pt-6")}>
        {/* Header: Workshop Type Badge & Event Type */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <Badge
            variant="outline"
            className="gap-1.5 border-emerald-500/20 bg-emerald-500/10 font-medium text-emerald-600 dark:text-emerald-400"
          >
            <IconPresentation className="size-3.5" />
            Workshop
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {formatEventType(registration.event.type)}
          </Badge>
        </div>

        {/* Workshop Title & Event Title */}
        <div className="mb-4 space-y-1">
          <h3 className="group-hover:text-primary line-clamp-2 text-lg leading-tight font-semibold transition-colors">
            {registration.workshop.title}
          </h3>
          <p className="text-muted-foreground line-clamp-1 text-sm">
            at {registration.event.title}
          </p>
        </div>

        {/* Details */}
        <div className="mb-5 space-y-2.5">
          {/* Facilitator */}
          <div className="flex items-center gap-2.5 text-sm">
            <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
              <IconUser className="text-primary size-4" />
            </div>
            <span className="text-muted-foreground">
              {registration.workshop.facilitator.name}
            </span>
          </div>

          {/* Schedule */}
          {registration.workshop.startAt && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                <IconCalendarEvent className="text-primary size-4" />
              </div>
              <span className="text-muted-foreground">
                {formatDate(registration.workshop.startAt)}
              </span>
            </div>
          )}

          {/* Event Location */}
          {registration.event.location && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                <IconMapPin className="text-primary size-4" />
              </div>
              <span className="text-muted-foreground line-clamp-1">
                {registration.event.location}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-sm">
            <div className="bg-muted flex size-8 items-center justify-center rounded-lg">
              <IconClock className="text-muted-foreground size-4" />
            </div>
            <span className="text-muted-foreground text-xs">
              Registered {formatDate(registration.registeredAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 gap-2" asChild>
            <Link
              href={
                `/events/${registration.event.id}/workshops/${registration.workshopId}/resources` as Route
              }
            >
              <IconFileDescription className="size-4" />
              Resources
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/events/${registration.event.id}` as Route}>
              <IconExternalLink className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Workshop Registration Group Component
// ============================================================================

interface WorkshopRegistrationGroupProps {
  title: string;
  registrations: WorkshopRegistration[];
  icon: typeof IconSparkles;
  defaultOpen?: boolean;
  accentColor?: string;
}

function WorkshopRegistrationGroup({
  title,
  registrations,
  icon: Icon,
  defaultOpen = true,
  accentColor,
}: WorkshopRegistrationGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (registrations.length === 0) return null;

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
                accentColor || "bg-emerald-500/10",
              )}
            >
              <Icon
                className={cn(
                  "size-5",
                  accentColor ? "text-white" : "text-emerald-500",
                )}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-muted-foreground text-sm">
                {registrations.length} workshop
                {registrations.length !== 1 ? "s" : ""}
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
          {registrations.map((registration) => (
            <WorkshopRegistrationCard
              key={registration.id}
              registration={registration}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function RegistrationsPage() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const { data, isLoading } = useQuery({
    ...orpc.events.myRegistrations.queryOptions({}),
    enabled: !!session,
  });

  const { data: badgesData } = useQuery({
    ...orpc.badges.listMyBadges.queryOptions({}),
    enabled: !!session,
  });

  // Fetch workshop registrations
  const { data: workshopData, isLoading: isLoadingWorkshops } = useQuery({
    ...orpc.workshops.myRegistrations.queryOptions({}),
    enabled: !!session,
  });

  // Create a map of badges by eventId for quick lookup
  const badgesByEventId = useMemo(() => {
    const map = new Map<string, MyBadge>();
    if (badgesData) {
      for (const badge of badgesData) {
        // Only use participant badges for registration cards
        if (badge.role === "participant") {
          map.set(badge.eventId, badge);
        }
      }
    }
    return map;
  }, [badgesData]);

  // Group registrations by event status
  const { liveRegistrations, upcomingRegistrations, pastRegistrations } =
    useMemo(() => {
      if (!data?.registrations) {
        return {
          liveRegistrations: [],
          upcomingRegistrations: [],
          pastRegistrations: [],
        };
      }

      const live: Registration[] = [];
      const upcoming: Registration[] = [];
      const past: Registration[] = [];

      for (const reg of data.registrations) {
        const regWithDates: Registration = {
          ...reg,
          registeredAt: new Date(reg.registeredAt),
          event: {
            ...reg.event,
            startDate: new Date(reg.event.startDate),
            endDate: new Date(reg.event.endDate),
          },
          badge: badgesByEventId.get(reg.eventId) ?? null,
        };

        const status = getEventStatus(
          regWithDates.event.startDate,
          regWithDates.event.endDate,
        );

        if (status === "live") {
          live.push(regWithDates);
        } else if (status === "upcoming") {
          upcoming.push(regWithDates);
        } else {
          past.push(regWithDates);
        }
      }

      // Sort by event start date
      live.sort(
        (a, b) => a.event.startDate.getTime() - b.event.startDate.getTime(),
      );
      upcoming.sort(
        (a, b) => a.event.startDate.getTime() - b.event.startDate.getTime(),
      );
      past.sort(
        (a, b) => b.event.startDate.getTime() - a.event.startDate.getTime(),
      );

      return {
        liveRegistrations: live,
        upcomingRegistrations: upcoming,
        pastRegistrations: past,
      };
    }, [data?.registrations, badgesByEventId]);

  // Group workshop registrations by status
  const workshopRegistrations = useMemo(() => {
    if (!workshopData?.registrations) {
      return [];
    }

    return workshopData.registrations.map((reg) => ({
      ...reg,
      registeredAt: new Date(reg.registeredAt),
      workshop: {
        ...reg.workshop,
        startAt: reg.workshop.startAt ? new Date(reg.workshop.startAt) : null,
        endAt: reg.workshop.endAt ? new Date(reg.workshop.endAt) : null,
      },
      event: {
        ...reg.event,
        startDate: new Date(reg.event.startDate),
        endDate: new Date(reg.event.endDate),
      },
    }));
  }, [workshopData?.registrations]);

  // Loading state
  if (isSessionPending || isLoading || isLoadingWorkshops) {
    return <LoadingSkeleton />;
  }

  // Auth required
  if (!session) {
    redirect("/login");
  }

  const totalRegistrations = data?.registrations?.length ?? 0;
  const totalWorkshopRegistrations = workshopRegistrations.length;
  const hasAnyRegistrations =
    totalRegistrations > 0 || totalWorkshopRegistrations > 0;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="border-border/40 bg-card/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/20">
                <IconTicket className="size-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  My Registrations
                </h1>
                <p className="text-muted-foreground">
                  View all events you have registered for
                </p>
              </div>
            </div>

            {/* Stats */}
            {hasAnyRegistrations && (
              <div className="flex flex-wrap gap-3">
                <StatCard
                  label="Live"
                  value={liveRegistrations.length}
                  icon={IconLivePhoto}
                  color="text-emerald-500"
                  bgColor="bg-emerald-500/10"
                />
                <StatCard
                  label="Upcoming"
                  value={upcomingRegistrations.length}
                  icon={IconCalendarTime}
                  color="text-primary"
                  bgColor="bg-primary/10"
                />
                <StatCard
                  label="Total"
                  value={totalRegistrations}
                  icon={IconSparkles}
                  color="text-amber-500"
                  bgColor="bg-amber-500/10"
                />
                {totalWorkshopRegistrations > 0 && (
                  <StatCard
                    label="Workshops"
                    value={totalWorkshopRegistrations}
                    icon={IconPresentation}
                    color="text-teal-500"
                    bgColor="bg-teal-500/10"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {!hasAnyRegistrations ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 scale-150 rounded-full bg-emerald-500/10 blur-2xl" />
              <div className="border-border/50 bg-card relative flex size-24 items-center justify-center rounded-3xl border">
                <IconCalendarOff className="text-muted-foreground size-12" />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold">No Registrations Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              You haven&apos;t registered for any events yet. Browse events to
              find something interesting!
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
            {/* Live Events */}
            <RegistrationGroup
              title="Happening Now"
              registrations={liveRegistrations}
              icon={IconSparkles}
              accentColor="bg-gradient-to-br from-emerald-500 to-green-500"
              defaultOpen={true}
            />

            {/* Upcoming Events */}
            <RegistrationGroup
              title="Upcoming Events"
              registrations={upcomingRegistrations}
              icon={IconCalendarEvent}
              defaultOpen={true}
            />

            {/* Past Events */}
            <RegistrationGroup
              title="Past Events"
              registrations={pastRegistrations}
              icon={IconClock}
              defaultOpen={false}
            />

            {/* Workshop Registrations */}
            {workshopRegistrations.length > 0 && (
              <>
                {/* Divider */}
                <div className="flex items-center gap-4 py-4">
                  <div className="via-border h-px flex-1 bg-gradient-to-r from-transparent to-transparent" />
                  <div className="h-2 w-2 rounded-full bg-emerald-500/30" />
                  <span className="text-muted-foreground text-sm font-medium">
                    Workshops
                  </span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500/30" />
                  <div className="via-border h-px flex-1 bg-gradient-to-l from-transparent to-transparent" />
                </div>

                <WorkshopRegistrationGroup
                  title="My Workshops"
                  registrations={workshopRegistrations}
                  icon={IconPresentation}
                  accentColor="bg-gradient-to-br from-teal-500 to-emerald-500"
                  defaultOpen={true}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
