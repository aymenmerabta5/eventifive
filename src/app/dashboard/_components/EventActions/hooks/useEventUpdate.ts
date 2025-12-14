import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";

export function useEventUpdate() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation(
    orpc.events.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message || "Event updated successfully");
        void queryClient.invalidateQueries({ queryKey: ["my-events"] });
        router.push("/dashboard?view=my-events");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update event");
      },
    })
  );
}
