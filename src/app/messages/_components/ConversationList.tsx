"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PenSquare } from "lucide-react";
import { ConversationItem } from "./ConversationItem";

export interface Conversation {
	id: string;
	name: string;
	avatar: string | null;
	lastMessage: string;
	timestamp: Date;
	unread: number;
	online: boolean;
}

interface ConversationListProps {
	conversations: Conversation[];
	selectedId: string | null;
	onSelect: (id: string) => void;
}

export function ConversationList({
	conversations,
	selectedId,
	onSelect,
}: ConversationListProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredConversations = conversations.filter((conversation) =>
		conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="flex flex-col h-full w-full bg-card">
			<div className="p-4 border-b border-border">
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-xl font-display font-semibold text-foreground">
						Messages
					</h1>
					<Button
						variant="ghost"
						size="icon"
						className="text-muted-foreground hover:text-foreground"
					>
						<PenSquare className="size-5" />
					</Button>
				</div>


				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
					<Input
						placeholder="Search conversations..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9 bg-muted/50 border-transparent focus-visible:border-ring"
					/>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto">
				{filteredConversations.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
						<p className="text-sm">No conversations found</p>
					</div>
				) : (
					<div className="py-2">
						{filteredConversations.map((conversation) => (
							<ConversationItem
								key={conversation.id}
								conversation={conversation}
								isSelected={selectedId === conversation.id}
								onClick={() => onSelect(conversation.id)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

