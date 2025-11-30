"use client";

import { useState, useCallback } from "react";
import { ConversationList } from "./_components/ConversationList";
import { MessageView } from "./_components/MessageView";
import { EmptyState } from "./_components/EmptyState";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import {
	useConversations,
	useMessageSubscription,
	type RealtimeMessage,
} from "./_lib";
import { Loader2 } from "lucide-react";

export default function MessagesPage() {
	const { data: session } = authClient.useSession();
	const currentUser = session?.user;

	const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
	const [isMobileConversationOpen, setIsMobileConversationOpen] = useState(false);

	const {
		data: conversations,
		isPending: isLoadingConversations,
		error: conversationsError,
	} = useConversations();

	const selectedConversation = conversations?.find(
		(c) => c.id === selectedConversationId
	);

	const handleNewMessage = useCallback((message: RealtimeMessage) => {
		console.log("New message received:", message);
	}, []);

	useMessageSubscription({
		currentUserId: currentUser?.id ?? "",
		onNewMessage: handleNewMessage,
	});

	const handleSelectConversation = (id: string) => {
		setSelectedConversationId(id);
		setIsMobileConversationOpen(true);
	};

	const handleBackToList = () => {
		setIsMobileConversationOpen(false);
	};

	const handleConversationCreated = (conversationId: string) => {
		setSelectedConversationId(conversationId);
		setIsMobileConversationOpen(true);
	};

	if (!currentUser) {
		return (
			<div className="flex h-screen items-center justify-center bg-background">
				<div className="text-center">
					<p className="text-muted-foreground">Please sign in to view messages</p>
				</div>
			</div>
		);
	}

	if (isLoadingConversations) {
		return (
			<div className="flex h-screen items-center justify-center bg-background">
				<Loader2 className="size-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (conversationsError) {
		return (
			<div className="flex h-screen items-center justify-center bg-background">
				<div className="text-center">
					<p className="text-destructive">Failed to load conversations</p>
					<p className="text-sm text-muted-foreground mt-1">
						{conversationsError.message}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-background">
			<div
				className={cn(
					"w-full md:w-80 lg:w-96 border-r border-border shrink-0",
					isMobileConversationOpen ? "hidden md:flex" : "flex"
				)}
			>
				<ConversationList
					conversations={conversations ?? []}
					selectedId={selectedConversationId}
					onSelect={handleSelectConversation}
					onConversationCreated={handleConversationCreated}
				/>
			</div>

			<div
				className={cn(
					"flex-1",
					!isMobileConversationOpen ? "hidden md:flex" : "flex"
				)}
			>
				{selectedConversation ? (
					<MessageView
						conversation={selectedConversation}
						currentUser={currentUser}
						onBack={handleBackToList}
					/>
				) : (
					<EmptyState />
				)}
			</div>
		</div>
	);
}
