"use client";

import { format, startOfWeek, addWeeks, subWeeks, addDays } from "date-fns";
import { type Session, mockSessions } from "@/mock-data/sessions";
import { useEffect, useRef, useState } from "react";
import { SessionSheet } from "./SessionSheet";
import { CalendarWeekHeader } from "./CalenderWeekHeader";
import { CalendarHoursColumn } from "./CalenderHoursColumn";
import { CalendarDayColumn } from "./CalenderDayColumn";
import { INITIAL_SCROLL_OFFSET } from "./CalenderUtils";

export function CalendarView() {
  // Local state for calendar navigation
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [sessions] = useState<Session[]>(mockSessions);

  const hoursScrollRef = useRef<HTMLDivElement>(null);
  const daysScrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasScrolledRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const today = new Date();

  // Navigation functions
  const goToNextWeek = () => setCurrentWeekStart((prev) => addWeeks(prev, 1));
  const goToPreviousWeek = () =>
    setCurrentWeekStart((prev) => subWeeks(prev, 1));

  // Get week days array
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  // Get sessions for current week
  const getCurrentWeekSessions = () => {
    const weekEnd = addDays(currentWeekStart, 6);
    const startStr = format(currentWeekStart, "yyyy-MM-dd");
    const endStr = format(weekEnd, "yyyy-MM-dd");
    return sessions.filter(
      (session) => session.date >= startStr && session.date <= endStr
    );
  };

  const currentWeekSessions = getCurrentWeekSessions();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const sessionsByDay: Record<string, Session[]> = {};
  weekDays.forEach((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    sessionsByDay[dayStr] = currentWeekSessions.filter((s) => s.date === dayStr);
  });

  const isTodayInWeek = weekDays.some(
    (day) => format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
  );

  useEffect(() => {
    const scrollToInitial = () => {
      if (!hasScrolledRef.current && hoursScrollRef.current) {
        hoursScrollRef.current.scrollTop = INITIAL_SCROLL_OFFSET;
        daysScrollRefs.current.forEach((ref) => {
          if (ref) {
            ref.scrollTop = INITIAL_SCROLL_OFFSET;
          }
        });
        hasScrolledRef.current = true;
      }
    };

    scrollToInitial();
    const timeoutId = setTimeout(scrollToInitial, 100);
    return () => clearTimeout(timeoutId);
  }, [weekDays]);

  const handleHoursScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    daysScrollRefs.current.forEach((ref) => {
      if (ref) {
        ref.scrollTop = scrollTop;
      }
    });
  };

  const handleDayScroll =
    (index: number) => (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      if (hoursScrollRef.current) {
        hoursScrollRef.current.scrollTop = scrollTop;
      }
      daysScrollRefs.current.forEach((ref, idx) => {
        if (ref && idx !== index) {
          ref.scrollTop = scrollTop;
        }
      });
    };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setSheetOpen(true);
  };

  return (
    <>
      <SessionSheet
        session={selectedSession}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
      <div className="flex flex-col h-full overflow-x-auto">
        <CalendarWeekHeader
          weekDays={weekDays}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
        />

        <div className="flex min-w-full w-max">
          <CalendarHoursColumn
            onScroll={handleHoursScroll}
            scrollRef={hoursScrollRef}
          />

          {weekDays.map((day, dayIndex) => {
            const dayStr = format(day, "yyyy-MM-dd");
            const daySessions = sessionsByDay[dayStr] || [];

            return (
              <CalendarDayColumn
                key={day.toISOString()}
                day={day}
                dayIndex={dayIndex}
                sessions={daySessions}
                today={today}
                isTodayInWeek={isTodayInWeek}
                currentTime={currentTime}
                onScroll={handleDayScroll}
                scrollRef={(el) => {
                  daysScrollRefs.current[dayIndex] = el;
                }}
                onSessionClick={handleSessionClick}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
