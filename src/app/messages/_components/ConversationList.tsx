"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PenSquare } from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import { NewConversationDialog } from "./NewConversationDialog";
import type { Conversation } from "../_lib/types";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onConversationCreated?: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onConversationCreated,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);

  const filteredConversations = conversations.filter((conversation) =>
    conversation.otherUser.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const handleConversationCreated = (conversationId: string) => {
    setIsNewConversationOpen(false);
    onConversationCreated?.(conversationId);
  };

  return (
    <div className="bg-card flex h-full w-full flex-col">
      <div className="border-border border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-display text-foreground text-xl font-semibold">
            Messages
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setIsNewConversationOpen(true)}
          >
            <PenSquare className="size-5" />
          </Button>
        </div>

        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted/50 focus-visible:border-ring border-transparent pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="text-muted-foreground flex h-40 flex-col items-center justify-center">
            <p className="text-sm">
              {conversations.length === 0
                ? "No conversations yet"
                : "No conversations found"}
            </p>
            {conversations.length === 0 && (
              <Button
                variant="link"
                className="text-primary mt-2"
                onClick={() => setIsNewConversationOpen(true)}
              >
                Start a conversation
              </Button>
            )}
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

      <NewConversationDialog
        open={isNewConversationOpen}
        onOpenChange={setIsNewConversationOpen}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}

export type { Conversation };
