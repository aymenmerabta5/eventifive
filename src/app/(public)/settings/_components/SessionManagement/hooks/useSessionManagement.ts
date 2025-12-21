"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { parseUserAgent } from "@/lib/session-parser";
import { QUERY_KEY } from "../constants";
import type { ParsedSession, DrawerVariant } from "../types";

export function useSessionManagement() {
  const { data: currentSession } = authClient.useSession();

  // Data fetching
  const {
    data: sessionsResponse,
    isPending,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => authClient.listSessions(),
  });

  const sessionsData = sessionsResponse?.data;

  // Local state
  const [selectedSession, setSelectedSession] = useState<ParsedSession | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState<DrawerVariant>("single");
  const [isRevoking, setIsRevoking] = useState(false);

  // Parse sessions with device info
  const sessions: ParsedSession[] = useMemo(
    () =>
      (sessionsData ?? []).map((session) => {
        const userAgent = session.userAgent ?? null;
        const ipAddress = session.ipAddress ?? null;
        const parsed = parseUserAgent(userAgent);
        return {
          id: session.id,
          token: session.token,
          userAgent,
          ipAddress,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          deviceLabel: parsed.deviceLabel,
          browser: parsed.browser,
          os: parsed.os,
          deviceType: parsed.deviceType,
          isCurrent: session.token === currentSession?.session?.token,
        };
      }),
    [sessionsData, currentSession?.session?.token],
  );

  // Sort sessions: current first, then by updatedAt descending
  const sortedSessions = useMemo(
    () =>
      [...sessions].sort((a, b) => {
        if (a.isCurrent) return -1;
        if (b.isCurrent) return 1;
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }),
    [sessions],
  );

  const otherSessionsCount = useMemo(
    () => sessions.filter((s) => !s.isCurrent).length,
    [sessions],
  );

  // Handlers
  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleRevokeClick = useCallback((session: ParsedSession) => {
    setSelectedSession(session);
    setDrawerVariant("single");
    setDrawerOpen(true);
  }, []);

  const handleRevokeAllClick = useCallback(() => {
    setSelectedSession(null);
    setDrawerVariant("all");
    setDrawerOpen(true);
  }, []);

  const handleRevokeConfirm = useCallback(async () => {
    setIsRevoking(true);
    try {
      if (drawerVariant === "single" && selectedSession) {
        await authClient.revokeSession({ token: selectedSession.token });
        toast.success("Session revoked successfully");
      } else {
        await authClient.revokeOtherSessions();
        toast.success("All other sessions have been signed out");
      }
      setDrawerOpen(false);
      refetch();
    } catch {
      toast.error(
        drawerVariant === "single"
          ? "Failed to revoke session"
          : "Failed to sign out other sessions",
      );
    } finally {
      setIsRevoking(false);
    }
  }, [drawerVariant, selectedSession, refetch]);

  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setDrawerOpen(open);
  }, []);

  return {
    // Data
    sessions,
    sortedSessions,
    otherSessionsCount,
    selectedSession,

    // Drawer state
    drawerOpen,
    drawerVariant,
    isRevoking,

    // Loading states
    isPending,
    error,
    isRefetching,

    // Handlers
    handleRefresh,
    handleRevokeClick,
    handleRevokeAllClick,
    handleRevokeConfirm,
    handleDrawerOpenChange,
  };
}
