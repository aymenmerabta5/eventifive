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
    })
  );

  const inviteReviewerMutation = useMutation(
    orpc.events.inviteReviewer.mutationOptions({
      onSuccess: async () => {
        toast.success("Reviewer invited");
        await invitesQuery.refetch();
      },
      onError: (error: Error) =>
        toast.error(error.message || "Failed to invite reviewer"),
    })
  );

  const inviteCommitteeMutation = useMutation(
    orpc.events.inviteCommittee.mutationOptions({
      onSuccess: async () => {
        toast.success("Committee member added");
        await invitesQuery.refetch();
      },
      onError: (error: Error) =>
        toast.error(error.message || "Failed to add committee member"),
    })
  );

  const removeSpeakerMutation = useMutation(
    orpc.events.removeSpeaker.mutationOptions({
      onSuccess: async () => {
        toast.success("Speaker removed");
        await invitesQuery.refetch();
      },
      onError: (error: Error) =>
        toast.error(error.message || "Failed to remove speaker"),
    })
  );

  const removeReviewerMutation = useMutation(
    orpc.events.removeReviewer.mutationOptions({
      onSuccess: async () => {
        toast.success("Reviewer removed");
        await invitesQuery.refetch();
      },
      onError: (error: Error) =>
        toast.error(error.message || "Failed to remove reviewer"),
    })
  );

  const removeCommitteeMutation = useMutation(
    orpc.events.removeCommittee.mutationOptions({
      onSuccess: async () => {
        toast.success("Committee member removed");
        await invitesQuery.refetch();
      },
      onError: (error: Error) =>
        toast.error(error.message || "Failed to remove committee member"),
    })
  );

  return {
    invitesQuery,
    inviteSpeakerMutation,
    inviteReviewerMutation,
    inviteCommitteeMutation,
    removeSpeakerMutation,
    removeReviewerMutation,
    removeCommitteeMutation,
  };
}
