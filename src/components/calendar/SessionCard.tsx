"use client";

import { ExternalLink } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getSessionDuration, formatTimeRange } from "./CalendarUtils";
import type { SessionCardProps } from "./types";

export function SessionCard({ session, style, onClick }: SessionCardProps) {
  const duration = getSessionDuration(session.startAt, session.endAt);
  const isVeryShortSession = duration < 30;
  const isMediumSession = duration >= 25 && duration < 60;
  const timeStr = formatTimeRange(session.startAt, session.endAt);

  // Get chair name for display
  const chairName = session.chair?.name;
  const hasChair = !!session.chair;

  if (isVeryShortSession) {
    return (
      <div
        className="bg-card border-border hover:bg-muted absolute right-2 left-2 z-10 flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 transition-colors"
        style={style}
        onClick={onClick}
      >
        <div className="size-1.5 shrink-0 rounded-full bg-cyan-500" />
        <h4 className="text-foreground flex-1 truncate text-[10px] font-semibold">
          {session.title}
        </h4>
        <span className="text-muted-foreground shrink-0 text-[9px]">
          {formatTimeRange(session.startAt, session.endAt).split(" - ")[0]}
        </span>
      </div>
    );
  }

  if (isMediumSession) {
    return (
      <div
        className="bg-card border-border hover:bg-muted absolute right-2 left-2 z-10 cursor-pointer rounded-lg border px-2.5 py-2 transition-colors"
        style={style}
        onClick={onClick}
      >
        <div className="flex h-full flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 shrink-0 rounded-full bg-cyan-500" />
            <h4 className="text-foreground flex-1 truncate text-[10px] font-semibold">
              {session.title}
            </h4>
          </div>
          <p className="text-muted-foreground text-[9px] tracking-wide uppercase">
            {timeStr}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-card border-border hover:bg-muted absolute right-2 left-2 z-10 cursor-pointer rounded-lg border p-3 transition-colors"
      style={style}
      onClick={onClick}
    >
      <div className="flex h-full flex-col gap-1">
        <div className="min-h-0 flex-1">
          <h4
            className={`text-foreground mb-1 text-xs font-semibold ${
              duration <= 60 ? "truncate whitespace-nowrap" : "line-clamp-2"
            }`}
          >
            {session.title}
          </h4>
          <p className="text-muted-foreground mb-2 text-[10px] tracking-wide uppercase">
            {timeStr}
          </p>

          {hasChair && (
            <div className="mb-2 flex items-center gap-1.5">
              <Avatar className="border-background size-5 border-2">
                {session.chair?.image ? (
                  <AvatarImage
                    src={session.chair.image}
                    alt={chairName || ""}
                  />
                ) : (
                  <AvatarFallback className="text-[8px]">
                    {chairName?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-muted-foreground truncate text-[10px]">
                {chairName}
              </span>
            </div>
          )}

          {session.room && (
            <p className="text-muted-foreground truncate text-[9px]">
              {session.room.name}
              {session.room.location && ` • ${session.room.location}`}
            </p>
          )}
        </div>

        {session.meetingLink && (
          <div className="mt-auto flex items-center gap-1.5 text-[10px] text-cyan-500">
            <div className="flex size-4 shrink-0 items-center justify-center rounded bg-cyan-500/10">
              <svg className="size-2.5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="flex-1 truncate">Join Meeting</span>
            <ExternalLink className="size-3 shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}
