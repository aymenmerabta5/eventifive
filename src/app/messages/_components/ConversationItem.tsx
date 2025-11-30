"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Conversation } from "../_lib/types";

interface ConversationItemProps {
	conversation: Conversation;
	isSelected: boolean;
	onClick: () => void;
}

function formatTimestamp(date: Date): string {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const minutes = Math.floor(diff / (1000 * 60));
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));

	if (minutes < 1) return "now";
	if (minutes < 60) return `${minutes}m`;
	if (hours < 24) return `${hours}h`;
	if (days < 7) return `${days}d`;

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
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
						{formatTimestamp(updatedAt)}
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
