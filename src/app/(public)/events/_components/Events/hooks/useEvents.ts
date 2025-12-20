"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import { QUERY_KEY, EVENT_ROWS } from "../constants";
import type { EventsByType, EventRowConfig } from "../types";

export function useEvents() {
	// Data fetching
	const {
		data,
		isPending,
		error,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: QUERY_KEY,
		queryFn: () => client.events.list(),
	});

	// Derived data - events by type
	const events: EventsByType = useMemo(() => ({
		congress: data?.congress ?? [],
		seminar: data?.seminar ?? [],
		workshop: data?.workshop ?? [],
		scientific_meeting: data?.scientific_meeting ?? [],
		conference: data?.conference ?? [],
		symposium: data?.symposium ?? [],
	}), [data]);

	// Check if all events are empty
	const isEmpty = useMemo(() => (
		events.congress.length === 0 &&
		events.seminar.length === 0 &&
		events.workshop.length === 0 &&
		events.scientific_meeting.length === 0 &&
		events.conference.length === 0 &&
		events.symposium.length === 0
	), [events]);

	// Get active rows (rows with events)
	const activeRows = useMemo(() => (
		EVENT_ROWS.filter((row) => events[row.key].length > 0)
	), [events]);

	// Handlers
	const handleRefresh = useCallback(() => {
		void refetch();
	}, [refetch]);

	return {
		// Data
		events,
		activeRows,
		isEmpty,

		// Loading states
		isPending,
		error,
		isRefetching,

		// Handlers
		handleRefresh,
	};
}
