import type { AdminEvent, EventStatus } from "./types";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
	dateStyle: "medium",
	timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	dateStyle: "medium",
});

export const formatDateTime = (value: Date | string): string =>
	dateTimeFormatter.format(new Date(value));

export const formatDate = (value: Date | string): string =>
	dateFormatter.format(new Date(value));

export const formatSchedule = (start: Date | string, end: Date | string): string => {
	const startDate = new Date(start);
	const endDate = new Date(end);

	const sameDay = startDate.toDateString() === endDate.toDateString();

	if (sameDay) {
		return `${formatDate(start)} • ${startDate.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		})} – ${endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
	}

	return `${formatDateTime(start)} → ${formatDateTime(end)}`;
};

export const getEventStatus = (event: AdminEvent): EventStatus => {
	const now = Date.now();
	const endTime = new Date(event.endDate).getTime();
	return endTime >= now ? "Upcoming" : "Completed";
};
