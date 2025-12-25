"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/utils/orpc";

interface ReadReceipt {
  userId: string;
  lastReadMessageId: string | null;
  readAt: Date;
}

interface ReadReceiptEvent {
  type: "read";
  conversationId: string;
  userId: string;
  lastReadMessageId: string;
  readAt: Date;
}

interface UseReadReceiptsOptions {
  conversationId: string;
  currentUserId: string;
}

export const READ_RECEIPTS_QUERY_KEY = (conversationId: string) => [
  "readReceipts",
  conversationId,
];

export function useReadReceipts({
  conversationId,
  currentUserId,
}: UseReadReceiptsOptions) {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [localReceipts, setLocalReceipts] = useState<Map<string, ReadReceipt>>(
    new Map(),
  );

  // Fetch initial read receipts
  const { data: initialReceipts, isLoading } = useQuery({
    queryKey: READ_RECEIPTS_QUERY_KEY(conversationId),
    queryFn: async () => {
      const receipts =
        await client.websocketsRouter.messages.getReadReceipts({
          conversationId,
        });
      return receipts;
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!conversationId,
  });

  // Update local state when initial data loads
  useEffect(() => {
    if (initialReceipts) {
      const receiptsMap = new Map<string, ReadReceipt>();
      for (const receipt of initialReceipts) {
        receiptsMap.set(receipt.userId, receipt);
      }
      setLocalReceipts(receiptsMap);
    }
  }, [initialReceipts]);

  // Mutation to mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await client.websocketsRouter.messages.markAsRead({
        conversationId,
        messageId,
      });
    },
    onSuccess: (_, messageId) => {
      // Optimistically update local state
      setLocalReceipts((prev) => {
        const newMap = new Map(prev);
        newMap.set(currentUserId, {
          userId: currentUserId,
          lastReadMessageId: messageId,
          readAt: new Date(),
        });
        return newMap;
      });
    },
  });

  // Subscribe to read receipt events
  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const subscribe = async () => {
      try {
        const subscription =
          await client.websocketsRouter.messages.subscribeReadReceipts({
            conversationId,
          });

        for await (const event of subscription) {
          if (signal.aborted) break;

          const readEvent = event as ReadReceiptEvent;

          // Update local state with new read receipt
          setLocalReceipts((prev) => {
            const newMap = new Map(prev);
            newMap.set(readEvent.userId, {
              userId: readEvent.userId,
              lastReadMessageId: readEvent.lastReadMessageId,
              readAt: new Date(readEvent.readAt),
            });
            return newMap;
          });

          // Also update query cache to ensure consistency
          queryClient.setQueryData(
            READ_RECEIPTS_QUERY_KEY(conversationId),
            (old: ReadReceipt[] | undefined) => {
              if (!old) return [readEvent];
              const filtered = old.filter((r) => r.userId !== readEvent.userId);
              return [...filtered, {
                userId: readEvent.userId,
                lastReadMessageId: readEvent.lastReadMessageId,
                readAt: new Date(readEvent.readAt),
              }];
            }
          );
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("[ReadReceipts:Client] Subscription error:", error);
        }
      }
    };

    subscribe();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [conversationId, currentUserId, queryClient]);

  // Helper to check if a message has been read by the other user
  const isMessageRead = useCallback(
    (messageId: string, senderId: string): boolean => {
      // Only check read status for messages sent by the current user
      if (senderId !== currentUserId) return false;

      // Find the other user's read receipt
      for (const [userId, receipt] of localReceipts) {
        if (userId !== currentUserId && receipt.lastReadMessageId) {
          // Message is read if it's the last read message or was sent before it
          // For simplicity, we'll just check if it matches the last read message
          // A more accurate check would compare message timestamps
          if (receipt.lastReadMessageId === messageId) {
            return true;
          }
        }
      }

      return false;
    },
    [currentUserId, localReceipts],
  );

  // Get the other user's read receipt
  const getOtherUserReadReceipt = useCallback((): ReadReceipt | null => {
    for (const [userId, receipt] of localReceipts) {
      if (userId !== currentUserId) {
        return receipt;
      }
    }
    return null;
  }, [currentUserId, localReceipts]);

  // Track the last marked message to prevent duplicate calls
  const lastMarkedRef = useRef<string | null>(null);

  // Mark a message as read
  const markAsRead = useCallback(
    (messageId: string) => {
      // Don't mark if already marked this message
      if (lastMarkedRef.current === messageId) {
        return;
      }
      lastMarkedRef.current = messageId;
      markAsReadMutation.mutate(messageId);
    },
    [markAsReadMutation.mutate],
  );

  return {
    readReceipts: localReceipts,
    isLoading,
    isMessageRead,
    getOtherUserReadReceipt,
    markAsRead,
    isMarking: markAsReadMutation.isPending,
  };
}

// Hook to check if a specific message is read
export function useIsMessageRead(
  conversationId: string,
  messageId: string,
  senderId: string,
  currentUserId: string,
) {
  const { isMessageRead } = useReadReceipts({
    conversationId,
    currentUserId,
  });

  return isMessageRead(messageId, senderId);
}
