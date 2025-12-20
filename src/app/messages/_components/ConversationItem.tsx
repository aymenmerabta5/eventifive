"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Conversation } from "../_lib/types";
import { getInitials } from "@/lib/string";
import { formatRelativeTime } from "@/lib/date";

interface ConversationItemProps {
	conversation: Conversation;
	isSelected: boolean;
	onClick: () => void;
}

export function ConversationItem({
	conversation,
	isSelected,
	onClick,
}: ConversationItemProps) {
	const { otherUser, lastMessage, updatedAt } = conversation;

	return (
		<button
			onClick={onClick}
			className={cn(
				"w-full flex items-center gap-3 px-4 py-3 transition-colors text-left",
				"hover:bg-accent/50",
				isSelected && "bg-accent"
			)}
		>
			<div className="relative shrink-0">
				<Avatar className="size-12">
					{otherUser.image && (
						<AvatarImage src={otherUser.image} alt={otherUser.name} />
					)}
					<AvatarFallback className="bg-primary/10 text-primary font-medium">
						{getInitials(otherUser.name)}
					</AvatarFallback>
				</Avatar>
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between gap-2">
					<span className="font-medium truncate text-foreground">
						{otherUser.name}
					</span>
					<span className="text-xs text-muted-foreground shrink-0">
						{formatRelativeTime(updatedAt)}
					</span>
				</div>
				<div className="flex items-center justify-between gap-2 mt-0.5">
					<p className="text-sm truncate text-muted-foreground">
						{lastMessage?.content ?? "No messages yet"}
					</p>
				</div>
			</div>
		</button>
	);
}
