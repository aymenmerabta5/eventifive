import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventItem } from "./EventItem";
import { MAX_RECENT_EVENTS } from "../constants";
import type { RecentEvent } from "../types";

interface ParticipationCardProps {
  recentEvents: RecentEvent[];
}

export function ParticipationCard({ recentEvents }: ParticipationCardProps) {
  const displayedEvents = recentEvents.slice(0, MAX_RECENT_EVENTS);

  return (
    <Card className="border-border/60 bg-background/70 rounded-3xl shadow-lg backdrop-blur-sm">
      <CardHeader className="px-6 pt-6 pb-0">
        <CardTitle className="text-lg">Recent participation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedEvents.length > 0 ? (
          displayedEvents.map((event) => (
            <EventItem key={event.id ?? event.title} event={event} />
          ))
        ) : (
          <p className="text-muted-foreground text-sm">
            No recent events yet. Link your talks or conferences to showcase
            activity.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
