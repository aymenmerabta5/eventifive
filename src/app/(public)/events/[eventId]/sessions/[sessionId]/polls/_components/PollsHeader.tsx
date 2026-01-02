"use client";

import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, BarChart3 } from "lucide-react";

interface PollsHeaderProps {
  session: {
    title: string;
    description: string | null;
    startAt: Date;
    endAt: Date;
    room: {
      name: string;
      location: string | null;
    } | null;
    chair: {
      name: string;
    } | null;
  };
  eventTitle: string;
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function PollsHeader({ session, eventTitle }: PollsHeaderProps) {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{eventTitle}</Badge>
      </div>

      <h1 className="text-2xl font-bold md:text-3xl">{session.title}</h1>

      {session.description && (
        <p className="text-muted-foreground">{session.description}</p>
      )}

      <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(session.startAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            {formatTime(session.startAt)} - {formatTime(session.endAt)}
          </span>
        </div>
        {session.room && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>
              {session.room.name}
              {session.room.location && ` - ${session.room.location}`}
            </span>
          </div>
        )}
      </div>

      {session.chair && (
        <div className="text-muted-foreground text-sm">
          <span className="font-medium">Session Chair:</span>{" "}
          {session.chair.name}
        </div>
      )}

      <div className="border-primary/20 bg-primary/5 flex items-start gap-3 rounded-lg border p-4">
        <BarChart3 className="text-primary mt-0.5 h-5 w-5" />
        <div className="text-sm">
          <p className="font-medium">Live Polls</p>
          <p className="text-muted-foreground">
            Participate in real-time polls during the session. Results update
            live as votes come in.
          </p>
        </div>
      </div>
    </div>
  );
}
