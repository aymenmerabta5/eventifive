"use client";

import { useRef, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	Phone,
	Video,
	MoreVertical,
	Loader2,
	UserRound,
} from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { useMessages, useSendMessage } from "../_lib/hooks";
import type { Conversation, Message } from "../_lib/types";
import Link from "next/link";

interface CurrentUser {
	id: string;
	name: string;
	image?: string | null;
}

interface MessageViewProps {
	conversation: Conversation;
	currentUser: CurrentUser;
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

export function MessageView({
	conversation,
	currentUser,
	onBack,
}: MessageViewProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);

	const {
		data: messagesData,
		isPending: isLoadingMessages,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useMessages(conversation.id);

	const sendMessage = useSendMessage();

	// Flatten pages into single array, reversed for chronological order
	const messages = useMemo(() => {
		if (!messagesData?.pages) return [];
		return messagesData.pages
			.flatMap((page) => page.messages)
			.reverse(); // API returns newest first, we want oldest first
	}, [messagesData]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages.length]);

	const handleSendMessage = async (content: string) => {
		await sendMessage.mutateAsync({
			conversationId: conversation.id,
			content,
			currentUserId: currentUser.id,
			currentUserName: currentUser.name,
			currentUserImage: currentUser.image ?? null,
		});
	};

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop } = e.currentTarget;
		// Load more when scrolled near top
		if (scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	};

	// Group messages by date
	const groupedMessages = useMemo(() => {
		return messages.reduce(
			(groups, message) => {
				const date = new Date(message.createdAt).toDateString();
				if (!groups[date]) {
					groups[date] = [];
				}
				groups[date].push(message);
				return groups;
			},
			{} as Record<string, Message[]>
		);
	}, [messages]);

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

	const { otherUser } = conversation;

	return (
		<div className="flex flex-col h-full w-full bg-background">
			{/* Header */}
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
						{otherUser.image && (
							<AvatarImage src={otherUser.image} alt={otherUser.name} />
						)}
						<AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
							{getInitials(otherUser.name)}
						</AvatarFallback>
					</Avatar>
				</div>

				<div className="flex-1 min-w-0">
					<h2 className="font-semibold text-foreground truncate">
						{otherUser.name}
					</h2>
				</div>

				<div className="flex items-center gap-1">
					<Button
						variant="outline"
						size="sm"
						asChild
						className="hidden sm:inline-flex"
					>
						<Link href={`/users/${otherUser.id}`} aria-label="View profile">
							<UserRound className="size-4 mr-2" />
							View profile
						</Link>
					</Button>
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

			{/* Messages */}
			<div
				ref={messagesContainerRef}
				className="flex-1 overflow-y-auto px-4 py-4"
				onScroll={handleScroll}
			>
				<div className="max-w-3xl mx-auto space-y-6">
					{/* Load more indicator */}
					{isFetchingNextPage && (
						<div className="flex justify-center py-2">
							<Loader2 className="size-5 animate-spin text-muted-foreground" />
						</div>
					)}

					{isLoadingMessages ? (
						<div className="flex justify-center py-8">
							<Loader2 className="size-6 animate-spin text-muted-foreground" />
						</div>
					) : messages.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
							<p className="text-sm">No messages yet</p>
							<p className="text-xs mt-1">
								Send a message to start the conversation
							</p>
						</div>
					) : (
						Object.entries(groupedMessages).map(([date, dateMessages]) => (
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
												isMe={message.senderId === currentUser.id}
												isFirstInGroup={isFirstInGroup}
												isLastInGroup={isLastInGroup}
											/>
										);
									})}
								</div>
							</div>
						))
					)}
					<div ref={messagesEndRef} />
				</div>
			</div>

			{/* Input */}
			<MessageInput
				onSend={handleSendMessage}
				disabled={sendMessage.isPending}
			/>
		</div>
	);
}
