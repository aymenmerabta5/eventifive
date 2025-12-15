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

  const isLoading = eventQuery.isPending || sessionsQuery.isPending || roomsQuery.isPending;
  const isError = eventQuery.isError || sessionsQuery.isError || roomsQuery.isError;

  // Transform sessions to include proper Date objects
  const sessions: SessionWithRelations[] = (sessionsQuery.data?.sessions ?? []).map((s) => ({
    ...s,
    startAt: new Date(s.startAt),
    endAt: new Date(s.endAt),
  }));

  const rooms = roomsQuery.data?.rooms ?? [];
  const event = eventQuery.data;

  if (isLoading) {
    return (
      <div className="container pt-16 flex flex-col gap-5 mx-auto">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="container pt-16 flex flex-col gap-5 mx-auto">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="text-destructive">Failed to load event calendar.</div>
      </div>
    );
  }

  const eventStartDate = new Date(event.startDate);
  const eventEndDate = new Date(event.endDate);

  return (
    <div className="container pt-16 flex flex-col gap-5 mx-auto">
      <h1 className="text-2xl font-bold">{event.title} - Schedule</h1>
      <p className="text-muted-foreground">
        View the event schedule from{" "}
        {eventStartDate.toLocaleDateString()} to{" "}
        {eventEndDate.toLocaleDateString()}.
      </p>
      <div className="h-[calc(100svh-14rem)] overflow-hidden lg:p-2 w-full">
        <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start h-full w-full bg-background">
          <div className="flex-1 overflow-hidden w-full">
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
