// Calendar starts at 8 AM and ends at 8 PM
export const START_HOUR = 8;
export const END_HOUR = 20;

// Hours from 8 AM to 8 PM (8:00 - 20:00)
export const HOURS_24 = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => {
  const hour = i + START_HOUR;
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
});

export const HOUR_HEIGHT = 120;
export const INITIAL_SCROLL_OFFSET = 1 * HOUR_HEIGHT; // Scroll to 9 AM (1 hour from start)

export function getEventHeight(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startTotal = (startHour ?? 0) * 60 + (startMin ?? 0);
  const endTotal = (endHour ?? 0) * 60 + (endMin ?? 0);
  const duration = endTotal - startTotal;

  if (duration < 60) {
    return Math.max(24, Math.round((duration / 60) * HOUR_HEIGHT));
  }

  return Math.max(40, Math.round((duration / 60) * HOUR_HEIGHT));
}

export function getEventTop(startTime: string): number {
  const [hour, minute] = startTime.split(":").map(Number);
  // Offset by START_HOUR since calendar begins at 8 AM
  const totalMinutes = ((hour ?? 0) - START_HOUR) * 60 + (minute ?? 0);
  const offset = totalMinutes * (HOUR_HEIGHT / 60);
  return Math.max(0, Math.round(offset));
}

export function getCurrentTimePosition(date: Date = new Date()): number {
  const hour = date.getHours();
  const minute = date.getMinutes();
  // Offset by START_HOUR since calendar begins at 8 AM
  const totalMinutes = (hour - START_HOUR) * 60 + minute;
  const offset = totalMinutes * (HOUR_HEIGHT / 60);
  return Math.max(0, Math.round(offset));
}

export function getEventDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  const startTotal = (startHour ?? 0) * 60 + (startMin ?? 0);
  const endTotal = (endHour ?? 0) * 60 + (endMin ?? 0);
  return endTotal - startTotal;
}

// Aliases for session-based naming
export const getSessionHeight = getEventHeight;
export const getSessionTop = getEventTop;
export const getSessionDuration = getEventDuration;
