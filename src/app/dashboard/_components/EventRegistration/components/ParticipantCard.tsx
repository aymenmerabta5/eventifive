import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials } from "../utils";
import { PAYMENT_STATUS_STYLES } from "../constants";
import type { Participant, PaymentStatus } from "../types";

interface ParticipantCardProps {
	participant: Participant;
}

export function ParticipantCard({ participant }: ParticipantCardProps) {
	return (
		<div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
			<Avatar className="h-10 w-10">
				<AvatarFallback className="bg-primary/10 text-primary text-xs">
					{getInitials(participant.userName)}
				</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex-1 space-y-1">
				<div className="truncate text-sm font-medium">
					{participant.userName ?? "Unknown user"}
				</div>
				<div className="text-muted-foreground truncate text-xs">
					{participant.userEmail}
				</div>
				<div className="flex flex-wrap items-center gap-2 pt-1">
					<Badge
						variant="outline"
						className={cn(
							"text-[10px] capitalize",
							PAYMENT_STATUS_STYLES[participant.paymentStatus as PaymentStatus],
						)}
					>
						{participant.paymentStatus}
					</Badge>
					<span className="text-muted-foreground text-[10px]">
						Registered {new Date(participant.registeredAt).toLocaleDateString()}
					</span>
				</div>
			</div>
		</div>
	);
}
