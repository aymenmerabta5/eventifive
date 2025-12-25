"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/utils/orpc";

interface TypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

interface UseTypingIndicatorOptions {
  conversationId: string;
  currentUserId: string;
}

// Debounce delay for typing notifications (ms)
const TYPING_DEBOUNCE_DELAY = 500;

// Auto-clear timeout if no typing events received (ms)
// Should be slightly longer than backend TTL to avoid flickering
const TYPING_TIMEOUT = 4000;

export function useTypingIndicator({
  conversationId,
  currentUserId,
}: UseTypingIndicatorOptions) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // Mutation to notify server that user is typing
  const setTypingMutation = useMutation({
    mutationFn: async () => {
      await client.websocketsRouter.messages.setTyping({ conversationId });
    },
  });

  // Mutation to clear typing status
  const clearTypingMutation = useMutation({
    mutationFn: async () => {
      await client.websocketsRouter.messages.clearTyping({ conversationId });
    },
  });

  // Debounced function to notify typing
  const notifyTyping = useCallback(() => {
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      setTypingMutation.mutate();
    }, TYPING_DEBOUNCE_DELAY);
  }, [setTypingMutation]);

  // Function to clear typing status (call when message is sent)
  const stopTyping = useCallback(() => {
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Notify server that user stopped typing
    clearTypingMutation.mutate();
  }, [clearTypingMutation]);

  // Subscribe to typing events
  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const subscribe = async () => {
      try {
        const subscription =
          await client.websocketsRouter.messages.subscribeTyping({
            conversationId,
          });

        for await (const event of subscription) {
          if (signal.aborted) break;

          const typingEvent = event as TypingEvent;

          // Skip own typing events (should be filtered by backend, but just in case)
          if (typingEvent.userId === currentUserId) continue;

          setTypingUsers((prev) => {
            const newSet = new Set(prev);

            if (typingEvent.isTyping) {
              newSet.add(typingEvent.userId);

              // Set timeout to auto-remove user if no updates received
              const existingTimeout = typingTimeoutRef.current.get(
                typingEvent.userId,
              );
              if (existingTimeout) {
                clearTimeout(existingTimeout);
              }

              const timeout = setTimeout(() => {
                setTypingUsers((current) => {
                  const updated = new Set(current);
                  updated.delete(typingEvent.userId);
                  return updated;
                });
                typingTimeoutRef.current.delete(typingEvent.userId);
              }, TYPING_TIMEOUT);

              typingTimeoutRef.current.set(typingEvent.userId, timeout);
            } else {
              newSet.delete(typingEvent.userId);

              // Clear timeout
              const existingTimeout = typingTimeoutRef.current.get(
                typingEvent.userId,
              );
              if (existingTimeout) {
                clearTimeout(existingTimeout);
                typingTimeoutRef.current.delete(typingEvent.userId);
              }
            }

            return newSet;
          });
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Typing subscription error:", error);
        }
      }
    };

    subscribe();

    return () => {
      abortControllerRef.current?.abort();

      // Clear all typing timeouts
      typingTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutRef.current.clear();

      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [conversationId, currentUserId]);

  return {
    typingUsers: Array.from(typingUsers),
    isOtherUserTyping: typingUsers.size > 0,
    notifyTyping,
    stopTyping,
  };
}

// Hook to get typing status for a specific user
export function useIsUserTyping(
  conversationId: string,
  userId: string,
  currentUserId: string,
) {
  const { typingUsers } = useTypingIndicator({
    conversationId,
    currentUserId,
  });

  return typingUsers.includes(userId);
}
