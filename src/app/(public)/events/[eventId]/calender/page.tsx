"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { CalendarView } from "@/components/calendar";
import type { SessionWithRelations } from "@/components/calendar";
import { orpc } from "@/utils/orpc";

export default function CalendarPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  // Fetch event details to get date range
  const eventQuery = useQuery({
    ...orpc.events.get.queryOptions({
      input: { id: eventId },
    }),
    enabled: !!eventId,
  });

  // Fetch sessions for this event
  const sessionsQuery = useQuery({
    ...orpc.sessions.listSessions.queryOptions({
      input: { eventId },
    }),
    enabled: !!eventId,
  });

  // Fetch rooms for this event
  const roomsQuery = useQuery({
    ...orpc.sessions.listRooms.queryOptions({
      input: { eventId },
    }),
    enabled: !!eventId,
  });

  const isLoading =
    eventQuery.isPending || sessionsQuery.isPending || roomsQuery.isPending;
  const isError =
    eventQuery.isError || sessionsQuery.isError || roomsQuery.isError;

  // Transform sessions to include proper Date objects
  const sessions: SessionWithRelations[] = (
    sessionsQuery.data?.sessions ?? []
  ).map((s) => ({
    ...s,
    startAt: new Date(s.startAt),
    endAt: new Date(s.endAt),
  }));

  const rooms = roomsQuery.data?.rooms ?? [];
  const event = eventQuery.data;

  if (isLoading) {
    return (
      <div className="container mx-auto flex flex-col gap-5 pt-16">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="container mx-auto flex flex-col gap-5 pt-16">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="text-destructive">Failed to load event calendar.</div>
      </div>
    );
  }

  const eventStartDate = new Date(event.startDate);
  const eventEndDate = new Date(event.endDate);

  return (
    <div className="container mx-auto flex flex-col gap-5 pt-16">
      <h1 className="text-2xl font-bold">{event.title} - Schedule</h1>
      <p className="text-muted-foreground">
        View the event schedule from {eventStartDate.toLocaleDateString()} to{" "}
        {eventEndDate.toLocaleDateString()}.
      </p>
      <div className="h-[calc(100svh-14rem)] w-full overflow-hidden lg:p-2">
        <div className="bg-background flex h-full w-full flex-col items-center justify-start overflow-hidden lg:rounded-md lg:border">
          <div className="w-full flex-1 overflow-hidden">
            <CalendarView
              eventId={eventId}
              sessions={sessions}
              rooms={rooms}
              eventStartDate={eventStartDate}
              eventEndDate={eventEndDate}
              chairOptions={[]}
              isEditable={false}
              isLoading={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
