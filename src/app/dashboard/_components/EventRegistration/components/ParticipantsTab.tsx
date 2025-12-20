"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";
import { ParticipantStatsCards } from "./ParticipantStatsCards";
import { ParticipantCard } from "./ParticipantCard";
import type { Participant } from "../types";

interface ParticipantsTabProps {
	participants: Participant[];
	isLoading: boolean;
}

export function ParticipantsTab({ participants, isLoading }: ParticipantsTabProps) {
	const stats = {
		total: participants.length,
		paid: participants.filter((p) => p.paymentStatus === "paid").length,
		pending: participants.filter((p) => p.paymentStatus === "pending").length,
	};

	return (
		<div className="space-y-6">
			<ParticipantStatsCards
				total={stats.total}
				paid={stats.paid}
				pending={stats.pending}
			/>

			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-lg font-semibold">Registered Participants</CardTitle>
					<CardDescription>
						All users who have registered for this event.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading && (
						<div className="text-muted-foreground text-sm">Loading...</div>
					)}

					{!isLoading && participants.length === 0 && (
						<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
							<Users className="h-12 w-12 text-muted-foreground/50" />
							<h3 className="mt-4 text-lg font-semibold">No participants yet</h3>
							<p className="mt-2 text-sm text-muted-foreground">
								Participants will appear here once they register for your event.
							</p>
						</div>
					)}

					{participants.length > 0 && (
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{participants.map((participant) => (
								<ParticipantCard key={participant.id} participant={participant} />
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
