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
import {
  IconLoader2,
  IconTicket,
  IconCalendarEvent,
  IconMapPin,
  IconExternalLink,
  IconCreditCard,
  IconClock,
  IconSparkles,
  IconChevronDown,
  IconCalendarOff,
  IconCheck,
  IconHourglass,
  IconX,
  IconRefresh,
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

type EventStatus = "live" | "upcoming" | "ended";

const paymentConfig: Record<string, { label: string; icon: typeof IconCheck; className: string }> = {
  paid: {
    label: "Paid",
    icon: IconCheck,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  pending: {
    label: "Pending",
    icon: IconHourglass,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  unpaid: {
    label: "Unpaid",
    icon: IconX,
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
  refunded: {
    label: "Refunded",
    icon: IconRefresh,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
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
}

// ============================================================================
// Registration Card Component
// ============================================================================

function RegistrationCard({ registration }: { registration: Registration }) {
  const status = getEventStatus(registration.event.startDate, registration.event.endDate);
  const payment = paymentConfig[registration.paymentStatus] ?? paymentConfig.pending!;
  const PaymentIcon = payment.icon;
  const isLive = status === "live";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-300",
        "bg-gradient-to-br from-card to-card/80",
        "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        isLive && "ring-2 ring-emerald-500/30 border-emerald-500/30"
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
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />

          {/* Status badge on image */}
          <div className="absolute top-3 left-3">
            {status === "live" ? (
              <Badge variant="default" className="gap-1.5 bg-emerald-500 hover:bg-emerald-500">
                <span className="size-1.5 rounded-full bg-white animate-ping" />
                Live Now
              </Badge>
            ) : status === "upcoming" ? (
              <Badge variant="secondary" className="gap-1.5">
                <IconSparkles className="size-3" />
                Upcoming
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-muted-foreground">
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
            "absolute top-0 left-0 right-0 h-1",
            status === "live" && "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 animate-pulse",
            status === "upcoming" && "bg-gradient-to-r from-primary/60 to-primary",
            status === "ended" && "bg-muted"
          )}
        />
      )}

      <div className={cn("p-5", !registration.event.imageUrl && "pt-6")}>
        {/* Header: Payment & Event Type */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <Badge variant="outline" className={cn("gap-1.5 font-medium", payment.className)}>
            <PaymentIcon className="size-3.5" />
            {payment.label}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {formatEventType(registration.event.type)}
          </Badge>
        </div>

        {/* Event Title & Description */}
        <div className="space-y-1 mb-4">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {registration.event.title}
          </h3>
          {registration.event.smallDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {registration.event.smallDescription}
            </p>
          )}
        </div>

        {/* Event Details */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center gap-2.5 text-sm">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
              <IconCalendarEvent className="size-4 text-primary" />
            </div>
            <span className="text-muted-foreground">
              {formatDate(registration.event.startDate)} – {formatDate(registration.event.endDate)}
            </span>
          </div>

          {registration.event.location && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                <IconMapPin className="size-4 text-primary" />
              </div>
              <span className="text-muted-foreground line-clamp-1">{registration.event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-sm">
            <div className="flex items-center justify-center size-8 rounded-lg bg-muted">
              <IconClock className="size-4 text-muted-foreground" />
            </div>
            <span className="text-muted-foreground text-xs">
              Registered {formatDate(registration.registeredAt)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button size="sm" className="w-full gap-2" asChild>
          <Link href={`/events/${registration.eventId}` as Route}>
            <IconExternalLink className="size-4" />
            View Event
          </Link>
        </Button>
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

function RegistrationGroup({ title, registrations, icon: Icon, defaultOpen = true, accentColor }: RegistrationGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (registrations.length === 0) return null;

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
                {registrations.length} event{registrations.length !== 1 ? "s" : ""}
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {registrations.map((registration) => (
            <RegistrationCard key={registration.id} registration={registration} />
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
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const { data, isLoading } = useQuery({
    ...orpc.events.myRegistrations.queryOptions({}),
    enabled: !!session,
  });

  // Group registrations by event status
  const { liveRegistrations, upcomingRegistrations, pastRegistrations } = useMemo(() => {
    if (!data?.registrations) {
      return { liveRegistrations: [], upcomingRegistrations: [], pastRegistrations: [] };
    }

    const live: Registration[] = [];
    const upcoming: Registration[] = [];
    const past: Registration[] = [];

    for (const reg of data.registrations) {
      const regWithDates = {
        ...reg,
        registeredAt: new Date(reg.registeredAt),
        event: {
          ...reg.event,
          startDate: new Date(reg.event.startDate),
          endDate: new Date(reg.event.endDate),
        },
      };

      const status = getEventStatus(regWithDates.event.startDate, regWithDates.event.endDate);

      if (status === "live") {
        live.push(regWithDates);
      } else if (status === "upcoming") {
        upcoming.push(regWithDates);
      } else {
        past.push(regWithDates);
      }
    }

    // Sort by event start date
    live.sort((a, b) => a.event.startDate.getTime() - b.event.startDate.getTime());
    upcoming.sort((a, b) => a.event.startDate.getTime() - b.event.startDate.getTime());
    past.sort((a, b) => b.event.startDate.getTime() - a.event.startDate.getTime());

    return { liveRegistrations: live, upcomingRegistrations: upcoming, pastRegistrations: past };
  }, [data?.registrations]);

  // Loading state
  if (isSessionPending || isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <IconLoader2 className="size-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your registrations...</p>
        </div>
      </div>
    );
  }

  // Auth required
  if (!session) {
    redirect("/login");
  }

  const totalRegistrations = data?.registrations?.length ?? 0;
  const hasAnyRegistrations = totalRegistrations > 0;

  return (
    <div className="container mx-auto min-h-screen py-8 px-4">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
            <IconTicket className="size-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Registrations</h1>
            <p className="text-muted-foreground text-sm">
              View all events you have registered for
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {!hasAnyRegistrations ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center size-20 rounded-3xl bg-muted/50 mb-6">
            <IconCalendarOff className="size-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Registrations Yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            You haven&apos;t registered for any events yet. Browse events to find something interesting!
          </p>
          <Button asChild>
            <Link href="/events">Browse Events</Link>
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
        </div>
      )}
    </div>
  );
}
