"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CalendarWeekHeaderProps } from "./types";

export function CalendarWeekHeader({
  weekDays,
  onPreviousWeek,
  onNextWeek,
  canGoPrevious = true,
  canGoNext = true,
}: CalendarWeekHeaderProps) {
  return (
    <div className="border-border bg-background sticky top-0 z-30 flex w-max min-w-full border-b">
      <div className="border-border flex w-[80px] shrink-0 items-center gap-1 border-r p-1.5 md:w-[104px] md:gap-2 md:p-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 md:size-8"
          onClick={onPreviousWeek}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="size-4 md:size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 md:size-8"
          onClick={onNextWeek}
          disabled={!canGoNext}
        >
          <ChevronRight className="size-4 md:size-5" />
        </Button>
      </div>
      {weekDays.map((day) => (
        <div
          key={day.toISOString()}
          className="border-border flex min-w-44 flex-1 items-center border-r p-1.5 last:border-r-0 md:p-2"
        >
          <div className="text-foreground text-xs font-medium md:text-sm">
            {format(day, "dd EEE").toUpperCase()}
          </div>
        </div>
      ))}
    </div>
  );
}
