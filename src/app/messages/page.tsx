"use client";

import { useState } from "react";
import { ConversationList } from "./_components/ConversationList";
import { MessageView } from "./_components/MessageView";
import { EmptyState } from "./_components/EmptyState";
import { cn } from "@/lib/utils";

// TODO: replace all of this with orpc realtime data later
const mockConversations = [
	{
		id: "1",
		name: "Sarah Chen",
		avatar: null,
		lastMessage: "Thanks for the event details! I'll be there.",
		timestamp: new Date(Date.now() - 1000 * 60 * 5),
		unread: 2,
		online: true,
	},
	{
		id: "2",
		name: "Alex Rivera",
		avatar: null,
		lastMessage: "Can we discuss the keynote speaker?",
		timestamp: new Date(Date.now() - 1000 * 60 * 30),
		unread: 0,
		online: true,
	},
	{
		id: "3",
		name: "Jordan Park",
		avatar: null,
		lastMessage: "The venue looks amazing!",
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
		unread: 0,
		online: false,
	},
	{
		id: "4",
		name: "Event Planning Team",
		avatar: null,
		lastMessage: "Meeting scheduled for tomorrow",
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
		unread: 5,
		online: false,
	},
];

const mockMessages = [
	{
		id: "m1",
		senderId: "other",
		content: "Hey! I saw the event you're organizing. Looks incredible!",
		timestamp: new Date(Date.now() - 1000 * 60 * 60),
	},
	{
		id: "m2",
		senderId: "me",
		content: "Thanks! We've been working really hard on it. Are you planning to attend?",
		timestamp: new Date(Date.now() - 1000 * 60 * 55),
	},
	{
		id: "m3",
		senderId: "other",
		content: "Definitely! I've already registered. Quick question though - is there parking available at the venue?",
		timestamp: new Date(Date.now() - 1000 * 60 * 50),
	},
	{
		id: "m4",
		senderId: "me",
		content: "Yes! There's a parking garage right next to the venue. First 3 hours are free for event attendees.",
		timestamp: new Date(Date.now() - 1000 * 60 * 45),
	},
	{
		id: "m5",
		senderId: "other",
		content: "Perfect! That's really helpful.",
		timestamp: new Date(Date.now() - 1000 * 60 * 10),
	},
	{
		id: "m6",
		senderId: "other",
		content: "Thanks for the event details! I'll be there.",
		timestamp: new Date(Date.now() - 1000 * 60 * 5),
	},
];

export default function MessagesPage() {
	const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
	const [isMobileConversationOpen, setIsMobileConversationOpen] = useState(false);

	const selectedConversation = mockConversations.find(
		(c) => c.id === selectedConversationId
	);

	const handleSelectConversation = (id: string) => {
		setSelectedConversationId(id);
		setIsMobileConversationOpen(true);
	};

	const handleBackToList = () => {
		setIsMobileConversationOpen(false);
	};

	return (
		<div className="flex h-screen bg-background">
			<div
				className={cn(
					"w-full md:w-80 lg:w-96 border-r border-border shrink-0",
					isMobileConversationOpen ? "hidden md:flex" : "flex"
				)}
			>
				<ConversationList
					conversations={mockConversations}
					selectedId={selectedConversationId}
					onSelect={handleSelectConversation}
				/>
			</div>

			<div
				className={`flex-1 ${
					!isMobileConversationOpen ? "hidden md:flex" : "flex"
				}`}
			>
				{selectedConversation ? (
					<MessageView
						conversation={selectedConversation}
						messages={mockMessages}
						onBack={handleBackToList}
					/>
				) : (
					<EmptyState />
				)}
			</div>
		</div>
	);
}

