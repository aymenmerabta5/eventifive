"use client";

import { useParams } from "next/navigation";
import WorkshopForm from "./_components/WorkshopForm";

export default function WorkshopPage() {
	const params = useParams<{ eventType: string; eventId: string }>();

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
			<WorkshopForm 
				eventId={params.eventId} 
				eventType={params.eventType} 
			/>
		</div>
	);
}
