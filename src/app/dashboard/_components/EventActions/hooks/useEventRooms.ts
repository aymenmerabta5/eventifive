import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import type { CreateRoomInput, UpdateRoomInput } from "@/lib/schemas/sessions";

export function useEventRooms(eventId: string | null, enabled: boolean = true) {
  const roomsQuery = useQuery({
    ...orpc.sessions.listRooms.queryOptions({
      input: { eventId: eventId ?? "" },
    }),
    enabled: !!eventId && enabled,
  });

  const createRoomMutation = useMutation(
    orpc.sessions.createRoom.mutationOptions({
      onSuccess: async () => {
        toast.success("Room created");
        await roomsQuery.refetch();
      },
      onError: (error: Error) =>
        toast.error(error.message || "Failed to create room"),
    })
  );

  const updateRoomMutation = useMutation(
    orpc.sessions.updateRoom.mutationOptions({
      onSuccess: async () => {
        toast.success("Room updated");
        await roomsQuery.refetch();
      },
      onError: (error: Error) =>
        toast.error(error.message || "Failed to update room"),
    })
  );

  const deleteRoomMutation = useMutation(
    orpc.sessions.deleteRoom.mutationOptions({
      onSuccess: async () => {
        toast.success("Room deleted");
        await roomsQuery.refetch();
      },
      onError: (error: Error) =>
        toast.error(error.message || "Failed to delete room"),
    })
  );

  // Helper functions for easier usage
  const createRoom = async (data: Omit<CreateRoomInput, "eventId">) => {
    if (!eventId) return;
    return createRoomMutation.mutateAsync({ eventId, ...data });
  };

  const updateRoom = async (data: UpdateRoomInput) => {
    return updateRoomMutation.mutateAsync(data);
  };

  const deleteRoom = async (roomId: number) => {
    return deleteRoomMutation.mutateAsync({ roomId });
  };

  return {
    rooms: roomsQuery.data?.rooms ?? [],
    isLoading: roomsQuery.isPending,
    isError: roomsQuery.isError,
    refetch: roomsQuery.refetch,
    createRoom,
    updateRoom,
    deleteRoom,
    isCreating: createRoomMutation.isPending,
    isUpdating: updateRoomMutation.isPending,
    isDeleting: deleteRoomMutation.isPending,
  };
}
