"use client";

import { useEventRegistration } from "./hooks";
import { RegistrationHeader, RegistrationTabs } from "./components";

interface EventRegistrationProps {
	eventId: string;
}

export function EventRegistration({ eventId }: EventRegistrationProps) {
	const {
		participants,
		workshopSubmissions,
		committeeSubmissions,
		isRefetching,
		isParticipantsLoading,
		isSubmissionsLoading,
		isUpdating,
		handleRefresh,
		handleBack,
		handleAcceptWorkshop,
		handleRejectWorkshop,
	} = useEventRegistration({ eventId });

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
