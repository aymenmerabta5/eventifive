"use client";

import { EventTypeCard } from "./EventTypeCard";
import type { EventCardData } from "../types";

interface EventsGridProps {
  events: EventCardData[];
}

export function EventsGrid({ events }: EventsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {events.map((event, index) => (
        <EventTypeCard key={event.id} event={event} index={index % 9} />
      ))}
    </div>
  );
}
