"use client";

import EventRow from "./_components/EventRow";
import { client } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";

export default function EventsPage() {
  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events"],
    queryFn: () => client.events.list(),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg">Failed to load events</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  if (events?.congress.length === 0 && events?.seminar.length === 0 && events?.workshop.length === 0 && events?.scientific_meeting.length === 0 && events?.conference.length === 0 && events?.symposium.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-4">
        <div className="text-center">
          <p className="text-foreground text-5xl font-bold">No events found</p>
          <p className="text-muted-foreground mt-2 text-sm">
            There are no events available at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="mb-10 text-center">
          <h1 className="text-foreground mb-3 bg-linear-to-r bg-clip-text text-5xl font-bold md:text-5xl">
            Upcoming Events
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Discover and join our exciting events. Connect, learn, and grow with
            our community.
          </p>
        </div>
        <div className="flex flex-col gap-10">
          {events?.congress && events.congress.length > 0 && (
            <EventRow
              events={events.congress}
              title="Congress"
              description="Join us for an exciting scientific meeting featuring cutting-edge research presentations and networking opportunities with leading experts in the field."
              route="/events/congress"
            />
          )}
          {events?.seminar && events.seminar.length > 0 && (
            <EventRow
              events={events.seminar}
              title="Seminar"
              description="Explore the latest technological innovations and trends. Connect with industry leaders and discover groundbreaking solutions shaping the future."
              route="/events/seminar"
            />
          )}
          {events?.workshop && events.workshop.length > 0 && (
            <EventRow
              events={events.workshop}
              title="Workshop"
              description="Hands-on learning experience designed to enhance your skills. Interactive sessions with practical exercises and expert guidance."
              route="/events/workshop"
            />
          )}
          {events?.scientific_meeting &&
            events.scientific_meeting.length > 0 && (
              <EventRow
                events={events.scientific_meeting}
                title="Scientific Meeting"
                description="Join us for an exciting scientific meeting featuring cutting-edge research presentations and networking opportunities with leading experts in the field."
                route="/events/scientific-meeting"
              />
            )}
          {events?.conference && events.conference.length > 0 && (
            <EventRow
              events={events.conference}
              title="Conference"
              description="Explore the latest technological innovations and trends. Connect with industry leaders and discover groundbreaking solutions shaping the future."
              route="/events/conference"
            />
          )}
          {events?.symposium && events.symposium.length > 0 && (
            <EventRow
              events={events.symposium}
              title="Symposium"
              description="Join us for an exciting symposium featuring cutting-edge research presentations and networking opportunities with leading experts in the field."
              route="/events/symposium"
            />
          )}
        </div>
      </div>
    </div>
  );
}
