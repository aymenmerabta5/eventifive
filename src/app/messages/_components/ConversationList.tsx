"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconSearch, IconEdit, IconMessagePlus } from "@tabler/icons-react";
import { ConversationItem } from "./ConversationItem";
import { NewConversationDialog } from "./NewConversationDialog";
import { usePresence } from "../_lib/hooks";
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

  // Get all user IDs for presence tracking
  const userIds = useMemo(
    () => conversations.map((c) => c.otherUser.id),
    [conversations],
  );

  // Track presence for all conversation users
  const { isOnline } = usePresence({ userIds });

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
    <div className="bg-card/50 flex h-full w-full flex-col">
      {/* Header */}
      <div className="border-border/50 border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="from-primary to-primary/80 shadow-primary/20 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg">
              <IconMessagePlus className="text-primary-foreground size-5" />
            </div>
            <div>
              <h1 className="font-display text-foreground text-lg font-semibold">
                Messages
              </h1>
              <p className="text-muted-foreground text-xs">
                {conversations.length} conversation
                {conversations.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-primary/10 hover:text-primary size-9 rounded-full transition-colors"
            onClick={() => setIsNewConversationOpen(true)}
          >
            <IconEdit className="size-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <IconSearch className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-border/50 bg-muted/30 focus-visible:border-primary/30 focus-visible:bg-background focus-visible:ring-primary/20 h-10 rounded-xl pl-10 transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex h-60 flex-col items-center justify-center px-4 text-center">
            <div className="bg-muted/50 mb-4 flex size-16 items-center justify-center rounded-2xl">
              <IconMessagePlus className="text-muted-foreground/50 size-8" />
            </div>
            <p className="text-foreground font-medium">
              {conversations.length === 0
                ? "No conversations yet"
                : "No results found"}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {conversations.length === 0
                ? "Start a new conversation to connect"
                : "Try a different search term"}
            </p>
            {conversations.length === 0 && (
              <Button
                variant="outline"
                className="mt-4 gap-2 rounded-full"
                onClick={() => setIsNewConversationOpen(true)}
              >
                <IconEdit className="size-4" />
                New Message
              </Button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedId === conversation.id}
                isOnline={isOnline(conversation.otherUser.id)}
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
