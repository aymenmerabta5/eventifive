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
import { OnlineIndicator } from "./OnlineIndicator";
import { TypingIndicator } from "./TypingIndicator";
import {
  useMessages,
  useSendMessage,
  useUserPresence,
  useTypingIndicator,
  useReadReceipts,
} from "../_lib/hooks";
import type { Conversation, Message } from "../_lib/types";
import Link from "next/link";
import type { Route } from "next";
import { getInitials } from "@/lib/string";
import { formatDateHeader, formatRelativeTime } from "@/lib/date";

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

  // Track online status of the other user
  const { isOnline, lastSeenAt } = useUserPresence(conversation.otherUser.id);

  // Typing indicator
  const { isOtherUserTyping, notifyTyping, stopTyping } = useTypingIndicator({
    conversationId: conversation.id,
    currentUserId: currentUser.id,
  });

  // Read receipts
  const { getOtherUserReadReceipt, markAsRead } = useReadReceipts({
    conversationId: conversation.id,
    currentUserId: currentUser.id,
  });

  // Flatten pages into single array, reversed for chronological order
  const messages = useMemo(() => {
    if (!messagesData?.pages) return [];
    return messagesData.pages.flatMap((page) => page.messages).reverse(); // API returns newest first, we want oldest first
  }, [messagesData]);

  // Get the other user's read receipt to determine read status
  const otherUserReadReceipt = getOtherUserReadReceipt();

  // Find the index of the last read message to determine which messages are read
  const lastReadMessageIndex = useMemo(() => {
    if (!otherUserReadReceipt?.lastReadMessageId) return -1;

    return messages.findIndex(
      (m) => m.id === otherUserReadReceipt.lastReadMessageId
    );
  }, [messages, otherUserReadReceipt?.lastReadMessageId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Mark messages as read when viewing the conversation
  useEffect(() => {
    if (messages.length > 0) {
      // Find the last message from the other user
      const lastMessageFromOther = [...messages]
        .reverse()
        .find((m) => m.senderId !== currentUser.id);

      if (lastMessageFromOther) {
        markAsRead(lastMessageFromOther.id);
      }
    }
  }, [messages, currentUser.id, markAsRead]);

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
          <OnlineIndicator isOnline={isOnline} size="sm" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-foreground truncate font-semibold">
            {otherUser.name}
          </h2>
          <p className="text-muted-foreground text-xs">
            {isOnline
              ? "Online"
              : lastSeenAt
                ? `Last seen ${formatRelativeTime(lastSeenAt)}`
                : "Offline"}
          </p>
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

                    // Check if this message has been read by the other user
                    // A message is read if:
                    // 1. It was sent by the current user (isMe)
                    // 2. Its index in the messages array is <= lastReadMessageIndex
                    const messageIndex = messages.findIndex(
                      (m) => m.id === message.id
                    );
                    const isRead =
                      message.senderId === currentUser.id &&
                      lastReadMessageIndex >= 0 &&
                      messageIndex <= lastReadMessageIndex;

                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isMe={message.senderId === currentUser.id}
                        isFirstInGroup={isFirstInGroup}
                        isLastInGroup={isLastInGroup}
                        isRead={isRead}
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

      {/* Typing Indicator */}
      {isOtherUserTyping && (
        <div className="border-border border-t px-4 py-2">
          <div className="mx-auto max-w-3xl">
            <TypingIndicator names={[conversation.otherUser.name]} />
          </div>
        </div>
      )}

      {/* Input */}
      <MessageInput
        onSend={handleSendMessage}
        onTyping={notifyTyping}
        onStopTyping={stopTyping}
        disabled={sendMessage.isPending}
      />
    </div>
  );
}
