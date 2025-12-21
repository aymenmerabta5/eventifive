"use client";

import {
  format,
  startOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  isAfter,
  isBefore,
  isSameDay,
} from "date-fns";
import { useEffect, useRef, useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionSheet } from "./SessionSheet";
import { SessionDialog } from "./SessionDialog";
import { CalendarWeekHeader } from "./CalendarWeekHeader";
import { CalendarHoursColumn } from "./CalendarHoursColumn";
import { CalendarDayColumn } from "./CalendarDayColumn";
import { INITIAL_SCROLL_OFFSET } from "./CalendarUtils";
import type {
  CalendarViewProps,
  SessionWithRelations,
  CreateSessionData,
  UpdateSessionData,
} from "./types";

export function CalendarView({
  eventId,
  sessions,
  rooms,
  eventStartDate,
  eventEndDate,
  chairOptions,
  onCreateSession,
  onUpdateSession,
  onDeleteSession,
  isEditable = false,
  isLoading = false,
}: CalendarViewProps) {
  // Calculate initial week based on event start date
  const getInitialWeekStart = useCallback(() => {
    return startOfWeek(eventStartDate, { weekStartsOn: 0 });
  }, [eventStartDate]);

  const [currentWeekStart, setCurrentWeekStart] = useState(getInitialWeekStart);

  const hoursScrollRef = useRef<HTMLDivElement>(null);
  const daysScrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasScrolledRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSession, setSelectedSession] =
    useState<SessionWithRelations | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] =
    useState<SessionWithRelations | null>(null);

  const today = new Date();

  // Update current week when event dates change
  useEffect(() => {
    setCurrentWeekStart(getInitialWeekStart());
  }, [getInitialWeekStart]);

  // Navigation functions with bounds checking
  const canGoPrevious = useCallback(() => {
    const prevWeekStart = subWeeks(currentWeekStart, 1);
    const prevWeekEnd = addDays(prevWeekStart, 6);
    // Can go previous if the previous week's end is >= event start date
    return !isBefore(prevWeekEnd, eventStartDate);
  }, [currentWeekStart, eventStartDate]);

  const canGoNext = useCallback(() => {
    const nextWeekStart = addWeeks(currentWeekStart, 1);
    // Can go next if the next week's start is <= event end date
    return !isAfter(nextWeekStart, eventEndDate);
  }, [currentWeekStart, eventEndDate]);

  const goToNextWeek = () => {
    if (canGoNext()) {
      setCurrentWeekStart((prev) => addWeeks(prev, 1));
    }
  };

  const goToPreviousWeek = () => {
    if (canGoPrevious()) {
      setCurrentWeekStart((prev) => subWeeks(prev, 1));
    }
  };

  // Get week days array, filtering to only show days within event range
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i),
  ).filter((day) => {
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const eventStart = new Date(
      eventStartDate.getFullYear(),
      eventStartDate.getMonth(),
      eventStartDate.getDate(),
    );
    const eventEnd = new Date(
      eventEndDate.getFullYear(),
      eventEndDate.getMonth(),
      eventEndDate.getDate(),
    );
    return dayStart >= eventStart && dayStart <= eventEnd;
  });

  // Get sessions for current view
  const getVisibleSessions = () => {
    if (weekDays.length === 0) return [];
    const startStr = format(weekDays[0]!, "yyyy-MM-dd");
    const endStr = format(weekDays[weekDays.length - 1]!, "yyyy-MM-dd");
    return sessions.filter((session) => {
      const sessionDate = format(session.startAt, "yyyy-MM-dd");
      return sessionDate >= startStr && sessionDate <= endStr;
    });
  };

  const visibleSessions = getVisibleSessions();

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const isTodayInWeek = weekDays.some(
    (day) => format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd"),
  );

  // Initial scroll to 9 AM
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

  // Synchronized scrolling
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

  const handleSessionClick = (session: SessionWithRelations) => {
    setSelectedSession(session);
    setSheetOpen(true);
  };

  const handleEmptySlotClick = (date: Date, hour: number) => {
    if (isEditable) {
      setEditingSession(null);
      setDialogOpen(true);
    }
  };

  const handleCreateClick = () => {
    setEditingSession(null);
    setDialogOpen(true);
  };

  const handleEditSession = () => {
    if (selectedSession) {
      setEditingSession(selectedSession);
      setDialogOpen(true);
    }
  };

  const handleDeleteSession = () => {
    if (selectedSession && onDeleteSession) {
      onDeleteSession(selectedSession.id);
      setSelectedSession(null);
    }
  };

  const handleDialogSubmit = (data: CreateSessionData | UpdateSessionData) => {
    if ("sessionId" in data) {
      onUpdateSession?.(data);
    } else {
      onCreateSession?.(data);
    }
    setDialogOpen(false);
    setEditingSession(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  if (weekDays.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center">
        No days to display for this event period.
      </div>
    );
  }

  return (
    <>
      <SessionSheet
        session={selectedSession}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onEdit={handleEditSession}
        onDelete={handleDeleteSession}
        isEditable={isEditable}
      />

      <SessionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        eventId={eventId}
        eventStartDate={eventStartDate}
        eventEndDate={eventEndDate}
        rooms={rooms}
        chairOptions={chairOptions}
        session={editingSession}
        onSubmit={handleDialogSubmit}
      />

      <div className="flex h-full flex-col overflow-hidden">
        {isEditable && (
          <div className="border-border bg-background flex items-center justify-between border-b px-4 py-2">
            <div className="text-muted-foreground text-sm">
              {format(eventStartDate, "MMM d")} -{" "}
              {format(eventEndDate, "MMM d, yyyy")}
            </div>
            <Button size="sm" onClick={handleCreateClick}>
              <Plus className="mr-2 size-4" />
              Add Session
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-x-auto">
          <div className="flex h-full w-max min-w-full flex-col">
            <CalendarWeekHeader
              weekDays={weekDays}
              onPreviousWeek={goToPreviousWeek}
              onNextWeek={goToNextWeek}
              canGoPrevious={canGoPrevious()}
              canGoNext={canGoNext()}
            />

            <div className="flex min-h-0 flex-1">
              <CalendarHoursColumn
                onScroll={handleHoursScroll}
                scrollRef={hoursScrollRef}
              />

              {weekDays.map((day, dayIndex) => (
                <CalendarDayColumn
                  key={day.toISOString()}
                  day={day}
                  dayIndex={dayIndex}
                  sessions={visibleSessions}
                  today={today}
                  isTodayInWeek={isTodayInWeek}
                  currentTime={currentTime}
                  onScroll={handleDayScroll}
                  scrollRef={(el) => {
                    daysScrollRefs.current[dayIndex] = el;
                  }}
                  onSessionClick={handleSessionClick}
                  onEmptySlotClick={handleEmptySlotClick}
                  isEditable={isEditable}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
