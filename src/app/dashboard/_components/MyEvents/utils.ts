import type { AdminEvent, EventStatus } from "./types";

// Re-export date utilities from centralized location for backwards compatibility
export { formatDate, formatDateTime, formatSchedule } from "@/lib/date";

export const getEventStatus = (event: AdminEvent): EventStatus => {
	const now = Date.now();
	const endTime = new Date(event.endDate).getTime();
	return endTime >= now ? "Upcoming" : "Completed";
};
