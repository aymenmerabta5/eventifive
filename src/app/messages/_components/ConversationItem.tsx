"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Conversation } from "../_lib/types";
import { getInitials } from "@/lib/string";
import { formatRelativeTime } from "@/lib/date";
import { OnlineIndicator } from "./OnlineIndicator";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  isOnline?: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  isOnline = false,
  onClick,
}: ConversationItemProps) {
  const { otherUser, lastMessage, updatedAt } = conversation;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200",
        "hover:bg-accent/50",
        isSelected && "bg-primary/10 hover:bg-primary/15",
      )}
    >
      <div className="relative shrink-0">
        <Avatar
          className={cn(
            "size-12 ring-2 ring-transparent transition-all",
            isSelected && "ring-primary/30",
            isOnline && !isSelected && "ring-green-500/30",
          )}
        >
          {otherUser.image && (
            <AvatarImage src={otherUser.image} alt={otherUser.name} />
          )}
          <AvatarFallback
            className={cn(
              "bg-gradient-to-br font-medium",
              isSelected
                ? "from-primary to-primary/80 text-primary-foreground"
                : "from-muted to-muted/80 text-muted-foreground",
            )}
          >
            {getInitials(otherUser.name)}
          </AvatarFallback>
        </Avatar>
        <OnlineIndicator isOnline={isOnline} size="md" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate font-medium transition-colors",
              isSelected ? "text-primary" : "text-foreground",
            )}
          >
            {otherUser.name}
          </span>
          <span
            className={cn(
              "shrink-0 text-xs",
              isSelected ? "text-primary/70" : "text-muted-foreground",
            )}
          >
            {formatRelativeTime(updatedAt)}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p
            className={cn(
              "truncate text-sm",
              isSelected ? "text-primary/70" : "text-muted-foreground",
            )}
          >
            {lastMessage?.content ?? "No messages yet"}
          </p>
        </div>
      </div>
    </button>
  );
}
