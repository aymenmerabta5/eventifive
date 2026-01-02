"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/utils/orpc";

export const PRESENCE_QUERY_KEY = (userIds: string[]) => [
  "presence",
  ...userIds.sort(),
];

interface PresenceState {
  isOnline: boolean;
  lastSeenAt: Date | null;
}

interface PresenceEvent {
  userId: string;
  status: "online" | "offline";
  lastSeenAt?: Date;
}

interface UsePresenceOptions {
  userIds: string[];
  enabled?: boolean;
}

export function usePresence({ userIds, enabled = true }: UsePresenceOptions) {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [presenceMap, setPresenceMap] = useState<Map<string, PresenceState>>(
    new Map(),
  );

  // Fetch initial presence state
  const { data: initialPresence, isLoading } = useQuery({
    queryKey: PRESENCE_QUERY_KEY(userIds),
    queryFn: async () => {
      if (userIds.length === 0) return {};
      return client.websocketsRouter.messages.getPresence({ userIds });
    },
    enabled: enabled && userIds.length > 0,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Update local state when initial data loads
  useEffect(() => {
    if (initialPresence) {
      const newMap = new Map<string, PresenceState>();
      for (const [userId, state] of Object.entries(initialPresence)) {
        newMap.set(userId, {
          isOnline: state.isOnline,
          lastSeenAt: state.lastSeenAt ? new Date(state.lastSeenAt) : null,
        });
      }
      setPresenceMap(newMap);
    }
  }, [initialPresence]);

  // Handle presence updates
  const handlePresenceUpdate = useCallback((event: PresenceEvent) => {
    setPresenceMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(event.userId, {
        isOnline: event.status === "online",
        lastSeenAt: event.lastSeenAt ? new Date(event.lastSeenAt) : null,
      });
      return newMap;
    });
  }, []);

  // Subscribe to presence updates
  useEffect(() => {
    if (!enabled || userIds.length === 0) return;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const subscribe = async () => {
      try {
        const subscription =
          await client.websocketsRouter.messages.subscribePresence({
            userIds,
          });

        for await (const event of subscription) {
          if (signal.aborted) break;
          handlePresenceUpdate(event as PresenceEvent);
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Presence subscription error:", error);
        }
      }
    };

    subscribe();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [userIds, enabled, handlePresenceUpdate]);

  // Helper to get presence for a specific user
  const getPresence = useCallback(
    (userId: string): PresenceState => {
      return presenceMap.get(userId) ?? { isOnline: false, lastSeenAt: null };
    },
    [presenceMap],
  );

  // Helper to check if a user is online
  const isOnline = useCallback(
    (userId: string): boolean => {
      return presenceMap.get(userId)?.isOnline ?? false;
    },
    [presenceMap],
  );

  return {
    presenceMap,
    getPresence,
    isOnline,
    isLoading,
  };
}

// Hook for single user presence
export function useUserPresence(userId: string | undefined) {
  const { getPresence, isOnline, isLoading } = usePresence({
    userIds: userId ? [userId] : [],
    enabled: !!userId,
  });

  return {
    isOnline: userId ? isOnline(userId) : false,
    lastSeenAt: userId ? getPresence(userId).lastSeenAt : null,
    isLoading,
  };
}
