"use client";

import type { Session } from "@/mock-data/sessions";
import {
  HOURS_24,
  HOUR_HEIGHT,
  getSessionTop,
  getSessionHeight,
} from "./CalenderUtils";
import { SessionCard } from "./SessionCard";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";

interface CalendarDayColumnProps {
  day: Date;
  dayIndex: number;
  sessions: Session[];
  today: Date;
  isTodayInWeek: boolean;
  currentTime: Date;
  onScroll: (index: number) => (e: React.UIEvent<HTMLDivElement>) => void;
  scrollRef: (el: HTMLDivElement | null) => void;
  onSessionClick: (session: Session) => void;
}

export function CalendarDayColumn({
  day,
  dayIndex,
  sessions,
  today,
  isTodayInWeek,
  currentTime,
  onScroll,
  scrollRef,
  onSessionClick,
}: CalendarDayColumnProps) {
  return (
    <div
      ref={scrollRef}
      onScroll={onScroll(dayIndex)}
      className="flex-1 border-r border-border last:border-r-0 relative min-w-44 overflow-y-auto"
    >
      {HOURS_24.map((hour) => (
        <div
          key={hour}
          className="border-b border-border"
          style={{ height: `${HOUR_HEIGHT}px` }}
        />
      ))}

      <CurrentTimeIndicator
        day={day}
        today={today}
        isTodayInWeek={isTodayInWeek}
        currentTime={currentTime}
      />

      {sessions.map((session) => {
        const top = getSessionTop(session.startTime);
        const height = getSessionHeight(session.startTime, session.endTime);

        return (
          <SessionCard
            key={session.id}
            session={session}
            style={{
              top: `${top + 4}px`,
              height: `${height - 8}px`,
            }}
            onClick={() => onSessionClick(session)}
          />
        );
      })}
    </div>
  );
}
