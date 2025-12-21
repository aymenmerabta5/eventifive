"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Conversation } from "../_lib/types";
import { getInitials } from "@/lib/string";
import { formatRelativeTime } from "@/lib/date";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
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
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
        "hover:bg-accent/50",
        isSelected && "bg-accent",
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

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-foreground truncate font-medium">
            {otherUser.name}
          </span>
          <span className="text-muted-foreground shrink-0 text-xs">
            {formatRelativeTime(updatedAt)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="text-muted-foreground truncate text-sm">
            {lastMessage?.content ?? "No messages yet"}
          </p>
        </div>
      </div>
    </button>
  );
}
