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
        className="absolute left-2 right-2 bg-card border border-border rounded-lg px-2 py-1 z-10 flex items-center gap-1.5 cursor-pointer hover:bg-muted transition-colors"
        style={style}
        onClick={onClick}
      >
        <div className="size-1.5 rounded-full bg-cyan-500 shrink-0" />
        <h4 className="text-[10px] font-semibold text-foreground truncate flex-1">
          {session.title}
        </h4>
        <span className="text-[9px] text-muted-foreground shrink-0">
          {formatTimeRange(session.startAt, session.endAt).split(" - ")[0]}
        </span>
      </div>
    );
  }

  if (isMediumSession) {
    return (
      <div
        className="absolute left-2 right-2 bg-card border border-border rounded-lg px-2.5 py-2 z-10 cursor-pointer hover:bg-muted transition-colors"
        style={style}
        onClick={onClick}
      >
        <div className="flex flex-col gap-1 h-full">
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-cyan-500 shrink-0" />
            <h4 className="text-[10px] font-semibold text-foreground truncate flex-1">
              {session.title}
            </h4>
          </div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wide">
            {timeStr}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute left-2 right-2 bg-card border border-border rounded-lg p-3 z-10 cursor-pointer hover:bg-muted transition-colors"
      style={style}
      onClick={onClick}
    >
      <div className="flex flex-col gap-1 h-full">
        <div className="flex-1 min-h-0">
          <h4
            className={`text-xs font-semibold text-foreground mb-1 ${
              duration <= 60 ? "truncate whitespace-nowrap" : "line-clamp-2"
            }`}
          >
            {session.title}
          </h4>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
            {timeStr}
          </p>

          {hasChair && (
            <div className="flex items-center gap-1.5 mb-2">
              <Avatar className="size-5 border-2 border-background">
                {session.chair?.image ? (
                  <AvatarImage src={session.chair.image} alt={chairName || ""} />
                ) : (
                  <AvatarFallback className="text-[8px]">
                    {chairName?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-[10px] text-muted-foreground truncate">
                {chairName}
              </span>
            </div>
          )}

          {session.room && (
            <p className="text-[9px] text-muted-foreground truncate">
              {session.room.name}
              {session.room.location && ` • ${session.room.location}`}
            </p>
          )}
        </div>

        {session.meetingLink && (
          <div className="flex items-center gap-1.5 text-[10px] text-cyan-500 mt-auto">
            <div className="size-4 rounded bg-cyan-500/10 flex items-center justify-center shrink-0">
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
