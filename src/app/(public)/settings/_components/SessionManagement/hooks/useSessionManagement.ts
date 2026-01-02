"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { parseUserAgent } from "@/lib/session-parser";
import { QUERY_KEY } from "../constants";
import type { ParsedSession, DialogVariant } from "../types";

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogVariant, setDialogVariant] = useState<DialogVariant>("single");
  const [isRevoking, setIsRevoking] = useState(false);

  // Parse sessions with device info
  const sessions: ParsedSession[] = useMemo(
    () =>
      (sessionsData ?? []).map((session) => {
        const parsed = parseUserAgent(session.userAgent ?? null);
        return {
          ...session,
          deviceLabel: parsed.deviceLabel,
          browser: parsed.browser,
          os: parsed.os,
          deviceType: parsed.deviceType,
          // Compare by session ID since useSession() may not expose token
          isCurrent: session.id === currentSession?.session?.id,
        };
      }),
    [sessionsData, currentSession?.session?.id],
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
    setDialogVariant("single");
    setDialogOpen(true);
  }, []);

  const handleRevokeAllClick = useCallback(() => {
    setSelectedSession(null);
    setDialogVariant("all");
    setDialogOpen(true);
  }, []);

  const handleRevokeConfirm = useCallback(async () => {
    setIsRevoking(true);
    try {
      if (dialogVariant === "single" && selectedSession) {
        // Prevent revoking current session
        if (selectedSession.isCurrent) {
          throw new Error("Cannot revoke your current session");
        }
        // Use custom oRPC endpoint to revoke session directly from database
        await orpc.profile.revokeSession.call({
          sessionId: selectedSession.id,
        });
        toast.success("Session revoked successfully");
      } else {
        // Revoke all other sessions (standard method, not multiSession)
        const { error } = await authClient.revokeOtherSessions();
        if (error) {
          throw new Error(error.message ?? "Failed to sign out other sessions");
        }
        toast.success("All other sessions have been signed out");
      }
      setDialogOpen(false);
      void refetch();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : dialogVariant === "single"
            ? "Failed to revoke session"
            : "Failed to sign out other sessions",
      );
    } finally {
      setIsRevoking(false);
    }
  }, [dialogVariant, selectedSession, refetch]);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
  }, []);

  return {
    // Data
    sessions,
    sortedSessions,
    otherSessionsCount,
    selectedSession,

    // Dialog state
    dialogOpen,
    dialogVariant,
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
    handleDialogOpenChange,
  };
}
