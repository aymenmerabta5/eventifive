"use client";

import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

export interface Message {
	id: string;
	senderId: string;
	content: string;
	timestamp: Date;
	status?: "sent" | "delivered" | "read";
}

interface MessageBubbleProps {
	message: Message;
	isFirstInGroup: boolean;
	isLastInGroup: boolean;
}

function formatTime(date: Date): string {
	return date.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
}

export function MessageBubble({
	message,
	isFirstInGroup,
	isLastInGroup,
}: MessageBubbleProps) {
	const isMe = message.senderId === "me";

	return (
		<div
			className={cn(
				"flex mb-7",
				isMe ? "justify-end" : "justify-start",
				!isLastInGroup && "mb-0.5"
			)}
		>
			<div
				className={cn(
					"max-w-[75%] md:max-w-[65%] px-4 py-2.5 relative",
					isMe
						? "bg-primary text-primary-foreground"
						: "bg-card border border-border text-card-foreground",
					// Rounded corners based on position in group
					isMe
						? cn(
								"rounded-2xl",
								isFirstInGroup && "rounded-tr-sm",
								!isFirstInGroup && !isLastInGroup && "rounded-r-sm",
								isLastInGroup && !isFirstInGroup && "rounded-br-sm"
						  )
						: cn(
								"rounded-2xl",
								isFirstInGroup && "rounded-tl-sm",
								!isFirstInGroup && !isLastInGroup && "rounded-l-sm",
								isLastInGroup && !isFirstInGroup && "rounded-bl-sm"
						  )
				)}
			>
				<p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
					{message.content}
				</p>

				{/* Timestamp and status */}
				<div
					className={cn(
						"flex items-center gap-1 mt-1",
						isMe ? "justify-end" : "justify-start"
					)}
				>
					<span
						className={cn(
							"text-[10px]",
							isMe ? "text-primary-foreground/70" : "text-muted-foreground"
						)}
					>
						{formatTime(message.timestamp)}
					</span>
					{isMe && message.status && (
						<span className="text-primary-foreground/70">
							{message.status === "read" ? (
								<CheckCheck className="size-3.5" />
							) : (
								<Check className="size-3.5" />
							)}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

