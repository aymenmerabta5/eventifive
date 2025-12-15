import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import type { CreateSessionInput, UpdateSessionInput } from "@/lib/schemas/sessions";
import type { SessionWithRelations } from "@/components/calendar";

export function useEventSessions(eventId: string | null, enabled: boolean = true) {
  const sessionsQuery = useQuery({
    ...orpc.sessions.listSessions.queryOptions({
      input: { eventId: eventId ?? "" },
    }),
    enabled: !!eventId && enabled,
  });

  const createSessionMutation = useMutation(
    orpc.sessions.createSession.mutationOptions({
      onSuccess: async () => {
        toast.success("Session created");
        await sessionsQuery.refetch();
      },
      onError: (error: Error) =>
        toast.error(error.message || "Failed to create session"),
    })
  );

  const updateSessionMutation = useMutation(
    orpc.sessions.updateSession.mutationOptions({
      onSuccess: async () => {
        toast.success("Session updated");
        await sessionsQuery.refetch();
      },
      onError: (error: Error) =>
        toast.error(error.message || "Failed to update session"),
    })
  );

  const deleteSessionMutation = useMutation(
    orpc.sessions.deleteSession.mutationOptions({
      onSuccess: async () => {
        toast.success("Session deleted");
        await sessionsQuery.refetch();
      },
      onError: (error: Error) =>
        toast.error(error.message || "Failed to delete session"),
    })
  );

  // Helper functions for easier usage
  const createSession = async (data: CreateSessionInput) => {
    return createSessionMutation.mutateAsync(data);
  };

  const updateSession = async (data: UpdateSessionInput) => {
    return updateSessionMutation.mutateAsync(data);
  };

  const deleteSession = async (sessionId: string) => {
    return deleteSessionMutation.mutateAsync({ sessionId });
  };

  // Transform sessions to include proper Date objects
  const sessions: SessionWithRelations[] = (sessionsQuery.data?.sessions ?? []).map((s) => ({
    ...s,
    startAt: new Date(s.startAt),
    endAt: new Date(s.endAt),
  }));

  return {
    sessions,
    isLoading: sessionsQuery.isPending,
    isError: sessionsQuery.isError,
    refetch: sessionsQuery.refetch,
    createSession,
    updateSession,
    deleteSession,
    isCreating: createSessionMutation.isPending,
    isUpdating: updateSessionMutation.isPending,
    isDeleting: deleteSessionMutation.isPending,
  };
}
