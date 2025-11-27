"use client";

import { useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import { MessageBubble, type Message } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import type { Conversation } from "./ConversationList";

interface MessageViewProps {
	conversation: Conversation;
	messages: Message[];
	onBack: () => void;
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export function MessageView({ conversation, messages, onBack }: MessageViewProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSendMessage = (content: string) => {
		// TODO: I will implement ORPC to send message there 
		console.log("Send message:", content);
	};

	const groupedMessages = messages.reduce((groups, message) => {
		const date = message.timestamp.toDateString();
		if (!groups[date]) {
			groups[date] = [];
		}
		groups[date].push(message);
		return groups;
	}, {} as Record<string, Message[]>);

	const formatDateHeader = (dateString: string): string => {
		const date = new Date(dateString);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (date.toDateString() === today.toDateString()) {
			return "Today";
		}
		if (date.toDateString() === yesterday.toDateString()) {
			return "Yesterday";
		}
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<div className="flex flex-col h-full w-full bg-background">
			<div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">

				<Button
					variant="ghost"
					size="icon"
					onClick={onBack}
					className="md:hidden text-muted-foreground"
				>
					<ArrowLeft className="size-5" />
				</Button>

				<div className="relative">
					<Avatar className="size-10">
						{conversation.avatar && (
							<AvatarImage src={conversation.avatar} alt={conversation.name} />
						)}
						<AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
							{getInitials(conversation.name)}
						</AvatarFallback>
					</Avatar>
					{conversation.online && (
						<span className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 border-2 border-card rounded-full" />
					)}
				</div>

				<div className="flex-1 min-w-0">
					<h2 className="font-semibold text-foreground truncate">
						{conversation.name}
					</h2>
					<p className="text-xs text-muted-foreground">
						{conversation.online ? (
							<span className="text-emerald-500">Online</span>
						) : (
							"Offline"
						)}
					</p>
				</div>

				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="text-muted-foreground hover:text-foreground"
					>
						<Phone className="size-5" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="text-muted-foreground hover:text-foreground"
					>
						<Video className="size-5" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="text-muted-foreground hover:text-foreground"
					>
						<MoreVertical className="size-5" />
					</Button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto px-4 py-4">
				<div className="max-w-3xl mx-auto space-y-6">
					{Object.entries(groupedMessages).map(([date, dateMessages]) => (
						<div key={date}>
							<div className="flex items-center justify-center mb-4">
								<div className="px-3 py-1 bg-muted rounded-full">
									<span className="text-xs font-medium text-muted-foreground">
										{formatDateHeader(date)}
									</span>
								</div>
							</div>

							<div className="space-y-1">
								{dateMessages.map((message, index) => {
									const prevMessage = dateMessages[index - 1];
									const nextMessage = dateMessages[index + 1];
									const isFirstInGroup =
										!prevMessage || prevMessage.senderId !== message.senderId;
									const isLastInGroup =
										!nextMessage || nextMessage.senderId !== message.senderId;

									return (
										<MessageBubble
											key={message.id}
											message={message}
											isFirstInGroup={isFirstInGroup}
											isLastInGroup={isLastInGroup}
										/>
									);
								})}
							</div>
						</div>
					))}
					<div ref={messagesEndRef} />
				</div>
			</div>

			<MessageInput onSend={handleSendMessage} />
		</div>
	);
}

