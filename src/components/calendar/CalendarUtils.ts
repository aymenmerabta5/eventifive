// Calendar starts at 8 AM and ends at 11 PM
export const START_HOUR = 8;
export const END_HOUR = 23;

// Hours from 8 AM to 11 PM (8:00 - 23:00)
export const HOURS_24 = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => {
  const hour = i + START_HOUR;
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
});

export const HOUR_HEIGHT = 120; // Height per hour slot for better visibility
export const INITIAL_SCROLL_OFFSET = 0; // Start at top (8 AM)

/**
 * Calculate the height of a session card based on duration
 */
export function getSessionHeight(startTime: Date, endTime: Date): number {
  const startTotal = startTime.getHours() * 60 + startTime.getMinutes();
  const endTotal = endTime.getHours() * 60 + endTime.getMinutes();
  const duration = endTotal - startTotal;

  if (duration < 60) {
    return Math.max(24, Math.round((duration / 60) * HOUR_HEIGHT));
  }

  return Math.max(40, Math.round((duration / 60) * HOUR_HEIGHT));
}

/**
 * Calculate the top position of a session card based on start time
 */
export function getSessionTop(startTime: Date): number {
  const hour = startTime.getHours();
  const minute = startTime.getMinutes();
  // Offset by START_HOUR since calendar begins at 8 AM
  const totalMinutes = (hour - START_HOUR) * 60 + minute;
  const offset = totalMinutes * (HOUR_HEIGHT / 60);
  return Math.max(0, Math.round(offset));
}

/**
 * Calculate the current time indicator position
 */
export function getCurrentTimePosition(date: Date = new Date()): number {
  const hour = date.getHours();
  const minute = date.getMinutes();
  // Offset by START_HOUR since calendar begins at 8 AM
  const totalMinutes = (hour - START_HOUR) * 60 + minute;
  const offset = totalMinutes * (HOUR_HEIGHT / 60);
  return Math.max(0, Math.round(offset));
}

/**
 * Calculate session duration in minutes
 */
export function getSessionDuration(startTime: Date, endTime: Date): number {
  const startTotal = startTime.getHours() * 60 + startTime.getMinutes();
  const endTotal = endTime.getHours() * 60 + endTime.getMinutes();
  return endTotal - startTotal;
}

// Re-export time formatting from centralized date utilities
export { formatTimeString, formatTimeRange } from "@/lib/date";
