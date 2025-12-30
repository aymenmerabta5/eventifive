"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SessionStatus = "live" | "upcoming" | "ended";

export function getSessionStatus(startAt: Date, endAt: Date): SessionStatus {
  const now = new Date();
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (now >= start && now <= end) return "live";
  if (now < start) return "upcoming";
  return "ended";
}

interface SessionStatusBadgeProps {
  status: SessionStatus;
  className?: string;
}

export function SessionStatusBadge({ status, className }: SessionStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "text-xs font-medium uppercase tracking-wide",
        status === "live" && [
          "border-destructive/30 bg-destructive/10 text-destructive",
          "animate-pulse",
        ],
        status === "upcoming" && [
          "border-primary/30 bg-primary/10 text-primary",
        ],
        status === "ended" && [
          "border-muted-foreground/30 bg-muted text-muted-foreground",
        ],
        className
      )}
    >
      {status === "live" && (
        <span className="mr-1.5 inline-flex size-1.5 rounded-full bg-destructive" />
      )}
      {status === "live" ? "Live" : status === "upcoming" ? "Upcoming" : "Ended"}
    </Badge>
  );
}
