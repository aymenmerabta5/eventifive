"use client";

import { useEvents } from "./hooks";
import {
	LoadingState,
	ErrorState,
	EmptyState,
	EventsHeader,
} from "./components";
import EventRow from "../EventRow";

export function Events() {
	const {
		events,
		activeRows,
		isEmpty,
		isPending,
		error,
		isRefetching,
		handleRefresh,
	} = useEvents();

	// Loading state - ALWAYS handle first
	if (isPending) {
		return <LoadingState />;
	}

	// Error state - Handle before rendering content
	if (error) {
		return (
			<ErrorState
				error={error}
				onRetry={handleRefresh}
				isRetrying={isRefetching}
			/>
		);
	}

	// Empty state - no events at all
	if (isEmpty) {
		return <EmptyState />;
	}

	// Main content
	return (
		<div className="min-h-screen">
			<div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
				<EventsHeader />
				<div className="flex flex-col gap-10">
					{activeRows.map((row) => (
						<EventRow
							key={row.key}
							events={events[row.key]}
							title={row.title}
							description={row.description}
							route={row.route}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
