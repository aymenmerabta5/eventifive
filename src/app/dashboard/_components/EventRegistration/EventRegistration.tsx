"use client";

import { useEventRegistration } from "./hooks";
import {
	LoadingState,
	ErrorState,
	EmptyState,
	RegistrationHeader,
	RegistrationTabs,
} from "./components";

interface EventRegistrationProps {
	eventId: string;
}

export function EventRegistration({ eventId }: EventRegistrationProps) {
	const {
		participants,
		workshopSubmissions,
		committeeSubmissions,
		isEmpty,
		isPending,
		isRefetching,
		isParticipantsLoading,
		isSubmissionsLoading,
		isUpdating,
		error,
		handleRefresh,
		handleBack,
		handleAcceptWorkshop,
		handleRejectWorkshop,
	} = useEventRegistration({ eventId });

	// Loading state - ALWAYS handle first
	if (isPending) {
		return (
			<div className="space-y-6">
				<RegistrationHeader
					onRefresh={handleRefresh}
					onBack={handleBack}
					isRefetching={false}
				/>
				<LoadingState />
			</div>
		);
	}

	// Error state - Handle before rendering content
	if (error) {
		return (
			<div className="space-y-6">
				<RegistrationHeader
					onRefresh={handleRefresh}
					onBack={handleBack}
					isRefetching={isRefetching}
				/>
				<ErrorState
					error={error}
					onRetry={handleRefresh}
					isRetrying={isRefetching}
				/>
			</div>
		);
	}

	// Empty state - no registrations yet
	if (isEmpty) {
		return (
			<div className="space-y-6">
				<RegistrationHeader
					onRefresh={handleRefresh}
					onBack={handleBack}
					isRefetching={isRefetching}
				/>
				<EmptyState />
			</div>
		);
	}

	// Main content
	return (
		<div className="space-y-6">
			<RegistrationHeader
				onRefresh={handleRefresh}
				onBack={handleBack}
				isRefetching={isRefetching}
			/>

			<RegistrationTabs
				participants={participants}
				committeeSubmissions={committeeSubmissions}
				workshopSubmissions={workshopSubmissions}
				isParticipantsLoading={isParticipantsLoading}
				isSubmissionsLoading={isSubmissionsLoading}
				onAcceptWorkshop={handleAcceptWorkshop}
				onRejectWorkshop={handleRejectWorkshop}
				isUpdating={isUpdating}
			/>
		</div>
	);
}
