"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Conversation } from "./ConversationList";

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
					{conversation.avatar && (
						<AvatarImage src={conversation.avatar} alt={conversation.name} />
					)}
					<AvatarFallback className="bg-primary/10 text-primary font-medium">
						{getInitials(conversation.name)}
					</AvatarFallback>
				</Avatar>
				{conversation.online && (
					<span className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-card rounded-full" />
				)}
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between gap-2">
					<span
						className={cn(
							"font-medium truncate",
							conversation.unread > 0
								? "text-foreground"
								: "text-foreground/90"
						)}
					>
						{conversation.name}
					</span>
					<span className="text-xs text-muted-foreground shrink-0">
						{formatTimestamp(conversation.timestamp)}
					</span>
				</div>
				<div className="flex items-center justify-between gap-2 mt-0.5">
					<p
						className={cn(
							"text-sm truncate",
							conversation.unread > 0
								? "text-foreground/80 font-medium"
								: "text-muted-foreground"
						)}
					>
						{conversation.lastMessage}
					</p>
					{conversation.unread > 0 && (
						<span className="shrink-0 min-w-5 h-5 px-1.5 flex items-center justify-center bg-primary text-primary-foreground text-xs font-medium rounded-full">
							{conversation.unread > 99 ? "99+" : conversation.unread}
						</span>
					)}
				</div>
			</div>
		</button>
	);
}

