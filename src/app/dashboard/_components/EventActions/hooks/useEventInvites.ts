import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";

export function useEventInvites(eventId: string | null, enabled: boolean) {
  const invitesQuery = useQuery({
    ...orpc.events.listInvites.queryOptions({
      input: { eventId: eventId ?? "" },
    }),
    enabled: !!eventId && enabled,
  });

  const inviteSpeakerMutation = useMutation(
    orpc.events.inviteSpeaker.mutationOptions({
      onSuccess: async () => {
        toast.success("Speaker invited");
        await invitesQuery.refetch();
      },
      onError: (error: Error) =>
        toast.error(error.message || "Failed to invite speaker"),
    }),
  );

  const inviteReviewerMutation = useMutation(
    orpc.events.inviteReviewer.mutationOptions({
      onSuccess: async () => {
        toast.success("Reviewer invited");
        await invitesQuery.refetch();
      },
      onError: (error: Error) =>
        toast.error(error.message || "Failed to invite reviewer"),
    }),
  );

  const inviteCommunicatorMutation = useMutation(
    orpc.events.inviteCommunicator.mutationOptions({
      onSuccess: async () => {
        toast.success("Communicator added");
        await invitesQuery.refetch();
      },
      onError: (error: Error) =>
        toast.error(error.message || "Failed to add communicator"),
    }),
  );

  const removeSpeakerMutation = useMutation(
    orpc.events.removeSpeaker.mutationOptions({
      onSuccess: async () => {
        toast.success("Speaker removed");
        await invitesQuery.refetch();
      },
      onError: (error: Error) =>
        toast.error(error.message || "Failed to remove speaker"),
    }),
  );

  const removeReviewerMutation = useMutation(
    orpc.events.removeReviewer.mutationOptions({
      onSuccess: async () => {
        toast.success("Reviewer removed");
        await invitesQuery.refetch();
      },
      onError: (error: Error) =>
        toast.error(error.message || "Failed to remove reviewer"),
    }),
  );

  const removeCommunicatorMutation = useMutation(
    orpc.events.removeCommunicator.mutationOptions({
      onSuccess: async () => {
        toast.success("Communicator removed");
        await invitesQuery.refetch();
      },
      onError: (error: Error) =>
        toast.error(error.message || "Failed to remove communicator"),
    }),
  );

  return {
    invitesQuery,
    inviteSpeakerMutation,
    inviteReviewerMutation,
    inviteCommunicatorMutation,
    removeSpeakerMutation,
    removeReviewerMutation,
    removeCommunicatorMutation,
  };
}
