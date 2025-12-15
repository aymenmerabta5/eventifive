"use client";

import { format } from "date-fns";
import {
  HOURS_24,
  HOUR_HEIGHT,
  getSessionTop,
  getSessionHeight,
} from "./CalendarUtils";
import { SessionCard } from "./SessionCard";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";
import type { CalendarDayColumnProps } from "./types";

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
  onEmptySlotClick,
  isEditable = false,
}: CalendarDayColumnProps) {
  const dayStr = format(day, "yyyy-MM-dd");

  // Filter sessions for this day
  const daySessions = sessions.filter(
    (s) => format(s.startAt, "yyyy-MM-dd") === dayStr
  );

  const handleHourClick = (hourIndex: number) => {
    if (isEditable && onEmptySlotClick) {
      const clickDate = new Date(day);
      clickDate.setHours(hourIndex + 8, 0, 0, 0); // 8 AM is hour 0
      onEmptySlotClick(clickDate, hourIndex + 8);
    }
  };

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll(dayIndex)}
      className="flex-1 border-r border-border last:border-r-0 relative min-w-44 overflow-y-auto scrollbar-hide"
    >
      {HOURS_24.map((hour, index) => (
        <div
          key={hour}
          className={`border-b border-border ${isEditable ? "cursor-pointer hover:bg-muted/50" : ""}`}
          style={{ height: `${HOUR_HEIGHT}px` }}
          onClick={() => handleHourClick(index)}
        />
      ))}

      <CurrentTimeIndicator
        day={day}
        today={today}
        isTodayInWeek={isTodayInWeek}
        currentTime={currentTime}
      />

      {daySessions.map((session) => {
        const top = getSessionTop(session.startAt);
        const height = getSessionHeight(session.startAt, session.endAt);

        return (
          <SessionCard
            key={session.id}
            session={session}
            style={{
              top: `${top + 4}px`,
              height: `${height - 8}px`,
            }}
            onClick={() => onSessionClick(session)}
            isEditable={isEditable}
          />
        );
      })}
    </div>
  );
}
