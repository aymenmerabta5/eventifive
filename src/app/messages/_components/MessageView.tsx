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
import type { Route } from "next";
import { getInitials } from "@/lib/string";
import { formatDateHeader } from "@/lib/date";

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
    return messagesData.pages.flatMap((page) => page.messages).reverse(); // API returns newest first, we want oldest first
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
      {} as Record<string, Message[]>,
    );
  }, [messages]);

  const { otherUser } = conversation;

  return (
    <div className="bg-background flex h-full w-full flex-col">
      {/* Header */}
      <div className="border-border bg-card flex items-center gap-3 border-b px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground md:hidden"
        >
          <ArrowLeft className="size-5" />
        </Button>

        <div className="relative">
          <Avatar className="size-10">
            {otherUser.image && (
              <AvatarImage src={otherUser.image} alt={otherUser.name} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {getInitials(otherUser.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-foreground truncate font-semibold">
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
            <Link
              href={`/users/${otherUser.id}` as Route}
              aria-label="View profile"
            >
              <UserRound className="mr-2 size-4" />
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
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Load more indicator */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-2">
              <Loader2 className="text-muted-foreground size-5 animate-spin" />
            </div>
          )}

          {isLoadingMessages ? (
            <div className="flex justify-center py-8">
              <Loader2 className="text-muted-foreground size-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-8">
              <p className="text-sm">No messages yet</p>
              <p className="mt-1 text-xs">
                Send a message to start the conversation
              </p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                <div className="mb-4 flex items-center justify-center">
                  <div className="bg-muted rounded-full px-3 py-1">
                    <span className="text-muted-foreground text-xs font-medium">
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
