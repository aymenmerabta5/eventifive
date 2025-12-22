"use client";

import { useState, useCallback, useEffect } from "react";
import { ConversationList } from "./_components/ConversationList";
import { MessageView } from "./_components/MessageView";
import { EmptyState } from "./_components/EmptyState";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import {
  useConversations,
  useMessageSubscription,
  useHeartbeat,
  type RealtimeMessage,
} from "./_lib";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function MessagesPage() {
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isMobileConversationOpen, setIsMobileConversationOpen] =
    useState(false);
  const searchParams = useSearchParams();
  const conversationIdFromParams = searchParams.get("conversationId");
  const [pendingConversationId, setPendingConversationId] = useState<
    string | null
  >(conversationIdFromParams);

  const {
    data: conversations,
    isPending: isLoadingConversations,
    error: conversationsError,
  } = useConversations();

  const selectedConversation = conversations?.find(
    (c) => c.id === selectedConversationId,
  );

  const handleNewMessage = useCallback((message: RealtimeMessage) => {
    console.log("New message received:", message);
  }, []);

  useMessageSubscription({
    currentUserId: currentUser?.id ?? "",
    onNewMessage: handleNewMessage,
  });

  // Keep presence alive with heartbeat
  useHeartbeat({ enabled: !!currentUser });

  useEffect(() => {
    setPendingConversationId(conversationIdFromParams);
  }, [conversationIdFromParams]);

  useEffect(() => {
    if (!pendingConversationId || !conversations) return;

    const exists = conversations.some(
      (conversation) => conversation.id === pendingConversationId,
    );
    if (exists) {
      setSelectedConversationId(pendingConversationId);
      setIsMobileConversationOpen(true);
      setPendingConversationId(null);
    }
  }, [conversations, pendingConversationId]);

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
      <div className="bg-background flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            Please sign in to view messages
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingConversations) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  if (conversationsError) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load conversations</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {conversationsError.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex h-screen">
      <div
        className={cn(
          "border-border w-full shrink-0 border-r md:w-80 lg:w-96",
          isMobileConversationOpen ? "hidden md:flex" : "flex",
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
          !isMobileConversationOpen ? "hidden md:flex" : "flex",
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
