"use client";

import { HOURS_24, HOUR_HEIGHT } from "./CalendarUtils";
import type { CalendarHoursColumnProps } from "./types";

export function CalendarHoursColumn({
  onScroll,
  scrollRef,
}: CalendarHoursColumnProps) {
  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="border-border scrollbar-hide relative w-[80px] shrink-0 overflow-y-auto border-r md:w-[104px]"
    >
      {HOURS_24.map((hour) => (
        <div
          key={hour}
          className="border-border text-muted-foreground border-b p-2 text-xs md:p-3 md:text-sm"
          style={{ height: `${HOUR_HEIGHT}px` }}
        >
          {hour}
        </div>
      ))}
    </div>
  );
}
