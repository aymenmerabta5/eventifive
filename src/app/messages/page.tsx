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
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import { IconMessageCircle } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function LoadingSkeleton() {
  return (
    <div className="bg-background flex h-screen">
      {/* Sidebar skeleton */}
      <div className="border-border/50 bg-card/50 hidden w-80 shrink-0 border-r md:flex md:flex-col lg:w-96">
        {/* Header */}
        <div className="border-border/50 border-b p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="size-9 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        {/* Conversation items */}
        <div className="flex-1 p-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-3">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main area skeleton */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="border-border/50 bg-card/50 flex items-center gap-3 border-b px-4 py-3">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-10 w-40 rounded-full" />
        </div>

        {/* Messages area */}
        <div className="flex-1 p-4">
          <div className="mx-auto max-w-3xl space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  i % 2 === 0 ? "justify-end" : "justify-start",
                )}
              >
                <Skeleton
                  className={cn(
                    "h-16 rounded-2xl",
                    i % 2 === 0 ? "w-48" : "w-56",
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Input skeleton */}
        <div className="border-border/50 bg-card/50 border-t px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-12 flex-1 rounded-2xl" />
            <Skeleton className="size-10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthRequired() {
  return (
    <div className="bg-background flex h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-primary/10 flex size-20 items-center justify-center rounded-2xl">
            <IconMessageCircle className="text-primary size-10" />
          </div>
        </div>
        <h1 className="text-foreground mb-2 text-2xl font-bold">
          Sign in to view messages
        </h1>
        <p className="text-muted-foreground mb-6">
          You need to be signed in to access your conversations
        </p>
        <Button asChild className="rounded-full px-8">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="bg-background flex h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-destructive/10 flex size-20 items-center justify-center rounded-2xl">
            <IconMessageCircle className="text-destructive size-10" />
          </div>
        </div>
        <h1 className="text-foreground mb-2 text-xl font-bold">
          Failed to load conversations
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">{message}</p>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}

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
    return <AuthRequired />;
  }

  if (isLoadingConversations) {
    return <LoadingSkeleton />;
  }

  if (conversationsError) {
    return <ErrorDisplay message={conversationsError.message} />;
  }

  return (
    <div className="bg-background flex h-screen">
      <div
        className={cn(
          "border-border/50 w-full shrink-0 border-r md:w-80 lg:w-96",
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
