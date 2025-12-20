"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, Presentation } from "lucide-react";
import { ParticipantsTab } from "./ParticipantsTab";
import { CommitteeTab } from "./CommitteeTab";
import { WorkshopTab } from "./WorkshopTab";
import type { Participant, CommitteeSubmission, WorkshopSubmission } from "../types";

interface RegistrationTabsProps {
	participants: Participant[];
	committeeSubmissions: CommitteeSubmission[];
	workshopSubmissions: WorkshopSubmission[];
	isParticipantsLoading: boolean;
	isSubmissionsLoading: boolean;
	onAcceptWorkshop: (submissionId: string) => void;
	onRejectWorkshop: (submissionId: string) => void;
	isUpdating: boolean;
}

export function RegistrationTabs({
	participants,
	committeeSubmissions,
	workshopSubmissions,
	isParticipantsLoading,
	isSubmissionsLoading,
	onAcceptWorkshop,
	onRejectWorkshop,
	isUpdating,
}: RegistrationTabsProps) {
	return (
		<Tabs defaultValue="participants" className="w-full space-y-6">
			<TabsList className="h-12 w-full justify-start">
				<TabsTrigger value="participants" className="gap-2">
					<Users className="size-4" />
					<span className="text-md hidden sm:inline">Participants</span>
					<Badge variant="secondary" className="ml-1 text-xs">
						{participants.length}
					</Badge>
				</TabsTrigger>
				<TabsTrigger value="committee-members" className="gap-2">
					<FileText className="size-4" />
					<span className="text-md hidden sm:inline">Committee Members</span>
					<Badge variant="secondary" className="ml-1 text-xs">
						{committeeSubmissions.length}
					</Badge>
				</TabsTrigger>
				<TabsTrigger value="workshop-facilitators" className="gap-2">
					<Presentation className="size-4" />
					<span className="text-md hidden sm:inline">Workshop Facilitators</span>
					<Badge variant="secondary" className="ml-1 text-xs">
						{workshopSubmissions.length}
					</Badge>
				</TabsTrigger>
			</TabsList>

			<TabsContent value="participants">
				<ParticipantsTab
					participants={participants}
					isLoading={isParticipantsLoading}
				/>
			</TabsContent>

			<TabsContent value="committee-members">
				<CommitteeTab
					submissions={committeeSubmissions}
					isLoading={isSubmissionsLoading}
				/>
			</TabsContent>

			<TabsContent value="workshop-facilitators">
				<WorkshopTab
					submissions={workshopSubmissions}
					isLoading={isSubmissionsLoading}
					onAccept={onAcceptWorkshop}
					onReject={onRejectWorkshop}
					isUpdating={isUpdating}
				/>
			</TabsContent>
		</Tabs>
	);
}
