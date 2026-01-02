"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  IconPresentation,
  IconChevronDown,
  IconCalendarOff,
  IconLoader2,
  IconAlertTriangle,
  IconRefresh,
  IconSparkles,
  IconUserPlus,
} from "@tabler/icons-react";
import { WorkshopCard, getWorkshopStatus, type Workshop } from "./WorkshopCard";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface WorkshopsSectionProps {
  eventId: string;
  isEventRegistered: boolean;
  isAuthenticated: boolean;
}

export function WorkshopsSection({
  eventId,
  isEventRegistered,
  isAuthenticated,
}: WorkshopsSectionProps) {
  const [pastWorkshopsOpen, setPastWorkshopsOpen] = useState(false);

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    ...orpc.workshops.listByEvent.queryOptions({
      input: { eventId },
    }),
    enabled: !!eventId,
  });

  // Group workshops by status
  const { liveWorkshops, upcomingWorkshops, pastWorkshops } = useMemo(() => {
    if (!data?.workshops) {
      return { liveWorkshops: [], upcomingWorkshops: [], pastWorkshops: [] };
    }

    const live: Workshop[] = [];
    const upcoming: Workshop[] = [];
    const past: Workshop[] = [];

    for (const workshop of data.workshops) {
      const workshopWithDates: Workshop = {
        ...workshop,
        startAt: workshop.startAt ? new Date(workshop.startAt) : null,
        endAt: workshop.endAt ? new Date(workshop.endAt) : null,
      };

      const status = getWorkshopStatus(
        workshopWithDates.startAt,
        workshopWithDates.endAt,
      );

      if (status === "live") {
        live.push(workshopWithDates);
      } else if (status === "upcoming" || status === "unscheduled") {
        upcoming.push(workshopWithDates);
      } else {
        past.push(workshopWithDates);
      }
    }

    // Sort: live and upcoming by startAt ascending, past by startAt descending
    const sortByStart = (a: Workshop, b: Workshop, desc = false) => {
      if (!a.startAt && !b.startAt) return 0;
      if (!a.startAt) return 1;
      if (!b.startAt) return -1;
      const diff = a.startAt.getTime() - b.startAt.getTime();
      return desc ? -diff : diff;
    };

    live.sort((a, b) => sortByStart(a, b));
    upcoming.sort((a, b) => sortByStart(a, b));
    past.sort((a, b) => sortByStart(a, b, true));

    return {
      liveWorkshops: live,
      upcomingWorkshops: upcoming,
      pastWorkshops: past,
    };
  }, [data?.workshops]);

  const totalWorkshops = data?.workshops?.length ?? 0;
  const hasAnyWorkshops = totalWorkshops > 0;
  const hasLiveOrUpcoming =
    liveWorkshops.length > 0 || upcomingWorkshops.length > 0;

  return (
    <div
      className={cn(
        "border-border/50 relative overflow-hidden rounded-3xl border",
        "from-card via-card to-card/80 bg-gradient-to-br",
      )}
    >
      {/* Pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative gradient */}
      <div className="via-chart-2/5 pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="border-border/50 flex items-center justify-between border-b p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="to-chart-2/10 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10">
              <IconPresentation className="size-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-display text-foreground text-xl font-bold">
                Workshops
              </h2>
              {hasAnyWorkshops && (
                <p className="text-muted-foreground text-sm">
                  {totalWorkshops} workshop{totalWorkshops !== 1 ? "s" : ""}{" "}
                  available
                </p>
              )}
            </div>
          </div>
          {hasAnyWorkshops && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <IconRefresh
                className={cn("size-4", isRefetching && "animate-spin")}
              />
              Refresh
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="relative p-6 sm:p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <IconLoader2 className="size-8 animate-spin text-emerald-500" />
              <p className="text-muted-foreground mt-4 text-sm">
                Loading workshops...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-destructive/10 mb-4 flex size-14 items-center justify-center rounded-xl">
                <IconAlertTriangle className="text-destructive size-7" />
              </div>
              <h3 className="font-display text-destructive text-lg font-semibold">
                Failed to load workshops
              </h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Please try again later.
              </p>
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive gap-2"
              >
                <IconRefresh className="size-4" />
                Try again
              </Button>
            </div>
          ) : !hasAnyWorkshops ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-muted/50 mb-4 flex size-16 items-center justify-center rounded-2xl">
                <IconCalendarOff className="text-muted-foreground size-8" />
              </div>
              <h3 className="font-display text-foreground text-lg font-semibold">
                No workshops yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Workshops will be announced soon.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Live Workshops */}
              {liveWorkshops.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="flex size-2 animate-pulse rounded-full bg-emerald-500" />
                    <h3 className="text-sm font-semibold tracking-wide text-emerald-500 uppercase">
                      Happening Now
                    </h3>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                      {liveWorkshops.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {liveWorkshops.map((workshop) => (
                      <WorkshopCard
                        key={workshop.id}
                        workshop={workshop}
                        eventId={eventId}
                        isEventRegistered={isEventRegistered}
                        isAuthenticated={isAuthenticated}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Workshops */}
              {upcomingWorkshops.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <IconSparkles className="size-4 text-emerald-500" />
                    <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                      Upcoming
                    </h3>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                      {upcomingWorkshops.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {upcomingWorkshops.map((workshop) => (
                      <WorkshopCard
                        key={workshop.id}
                        workshop={workshop}
                        eventId={eventId}
                        isEventRegistered={isEventRegistered}
                        isAuthenticated={isAuthenticated}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Past Workshops (Collapsible) */}
              {pastWorkshops.length > 0 && (
                <Collapsible
                  open={pastWorkshopsOpen}
                  onOpenChange={setPastWorkshopsOpen}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between",
                        "text-muted-foreground hover:text-foreground",
                        "border-border/50 hover:border-border border",
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
                        Past Workshops
                        <span className="bg-muted rounded-full px-2 py-0.5 text-xs font-medium">
                          {pastWorkshops.length}
                        </span>
                      </span>
                      <IconChevronDown
                        className={cn(
                          "size-4 transition-transform duration-200",
                          pastWorkshopsOpen && "rotate-180",
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-4">
                    {pastWorkshops.map((workshop) => (
                      <WorkshopCard
                        key={workshop.id}
                        workshop={workshop}
                        eventId={eventId}
                        isEventRegistered={isEventRegistered}
                        isAuthenticated={isAuthenticated}
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Registration prompt for non-registered users */}
              {!isEventRegistered && hasLiveOrUpcoming && (
                <div
                  className={cn(
                    "rounded-2xl border border-dashed border-emerald-500/30",
                    "via-chart-2/5 bg-gradient-to-r from-emerald-500/5 to-emerald-500/5",
                    "p-6 text-center",
                  )}
                >
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-emerald-500/10">
                    <IconUserPlus className="size-6 text-emerald-500" />
                  </div>
                  <h3 className="font-display text-foreground font-semibold">
                    Register for the event
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Join this event to register for workshops and access
                    materials.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
