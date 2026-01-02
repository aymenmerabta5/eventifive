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
  IconCalendarEvent,
  IconChevronDown,
  IconCalendarOff,
  IconLoader2,
  IconAlertTriangle,
  IconRefresh,
  IconSparkles,
  IconUserPlus,
} from "@tabler/icons-react";
import { SessionCard, type Session } from "./SessionCard";
import { getSessionStatus } from "./SessionStatusBadge";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface SessionsSectionProps {
  eventId: string;
  isRegistered: boolean;
}

export function SessionsSection({
  eventId,
  isRegistered,
}: SessionsSectionProps) {
  const [pastSessionsOpen, setPastSessionsOpen] = useState(false);

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    ...orpc.sessions.listSessions.queryOptions({
      input: { eventId },
    }),
    enabled: !!eventId,
  });

  // Group sessions by status
  const { liveSessions, upcomingSessions, pastSessions } = useMemo(() => {
    if (!data?.sessions) {
      return { liveSessions: [], upcomingSessions: [], pastSessions: [] };
    }

    const live: Session[] = [];
    const upcoming: Session[] = [];
    const past: Session[] = [];

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

    // Sort: live and upcoming by startAt ascending, past by startAt descending (most recent first)
    live.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    upcoming.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    past.sort((a, b) => b.startAt.getTime() - a.startAt.getTime());

    return {
      liveSessions: live,
      upcomingSessions: upcoming,
      pastSessions: past,
    };
  }, [data?.sessions]);

  const totalSessions = data?.sessions?.length ?? 0;
  const hasAnySessions = totalSessions > 0;
  const hasLiveOrUpcoming =
    liveSessions.length > 0 || upcomingSessions.length > 0;

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
      <div className="from-primary/10 via-chart-2/5 pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-gradient-to-br to-transparent blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="border-border/50 flex items-center justify-between border-b p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="from-primary/10 to-chart-2/10 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br">
              <IconCalendarEvent className="text-primary size-6" />
            </div>
            <div>
              <h2 className="font-display text-foreground text-xl font-bold">
                Sessions
              </h2>
              {hasAnySessions && (
                <p className="text-muted-foreground text-sm">
                  {totalSessions} session{totalSessions !== 1 ? "s" : ""}{" "}
                  scheduled
                </p>
              )}
            </div>
          </div>
          {hasAnySessions && (
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
              <IconLoader2 className="text-primary size-8 animate-spin" />
              <p className="text-muted-foreground mt-4 text-sm">
                Loading sessions...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-destructive/10 mb-4 flex size-14 items-center justify-center rounded-xl">
                <IconAlertTriangle className="text-destructive size-7" />
              </div>
              <h3 className="font-display text-destructive text-lg font-semibold">
                Failed to load sessions
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
          ) : !hasAnySessions ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-muted/50 mb-4 flex size-16 items-center justify-center rounded-2xl">
                <IconCalendarOff className="text-muted-foreground size-8" />
              </div>
              <h3 className="font-display text-foreground text-lg font-semibold">
                No sessions yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Sessions will be announced soon.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Live Sessions */}
              {liveSessions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-destructive flex size-2 animate-pulse rounded-full" />
                    <h3 className="text-destructive text-sm font-semibold tracking-wide uppercase">
                      Live Now
                    </h3>
                    <span className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs font-medium">
                      {liveSessions.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {liveSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        eventId={eventId}
                        isRegistered={isRegistered}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Sessions */}
              {upcomingSessions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <IconSparkles className="text-primary size-4" />
                    <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                      Upcoming
                    </h3>
                    <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                      {upcomingSessions.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        eventId={eventId}
                        isRegistered={isRegistered}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Past Sessions (Collapsible) */}
              {pastSessions.length > 0 && (
                <Collapsible
                  open={pastSessionsOpen}
                  onOpenChange={setPastSessionsOpen}
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
                        Past Sessions
                        <span className="bg-muted rounded-full px-2 py-0.5 text-xs font-medium">
                          {pastSessions.length}
                        </span>
                      </span>
                      <IconChevronDown
                        className={cn(
                          "size-4 transition-transform duration-200",
                          pastSessionsOpen && "rotate-180",
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-4">
                    {pastSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        eventId={eventId}
                        isRegistered={isRegistered}
                        compact
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Registration prompt for non-registered users */}
              {!isRegistered && hasLiveOrUpcoming && (
                <div
                  className={cn(
                    "border-primary/30 rounded-2xl border border-dashed",
                    "from-primary/5 via-chart-2/5 to-primary/5 bg-gradient-to-r",
                    "p-6 text-center",
                  )}
                >
                  <div className="bg-primary/10 mx-auto mb-3 flex size-12 items-center justify-center rounded-xl">
                    <IconUserPlus className="text-primary size-6" />
                  </div>
                  <h3 className="font-display text-foreground font-semibold">
                    Register to unlock features
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Join this event to access Q&A, Polls, and meeting links.
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
