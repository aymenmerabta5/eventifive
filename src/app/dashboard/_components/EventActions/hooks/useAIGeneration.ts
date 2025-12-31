import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";

/**
 * Hook for AI-powered event description generation
 * Requires user to have an active subscription or be a super_admin
 */
export function useAIGeneration() {
  const mutation = useMutation(
    orpc.ai.generateEventDescription.mutationOptions({
      onSuccess: () => {
        toast.success("Description generated successfully");
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to generate description");
      },
    })
  );

  return {
    generate: mutation.mutate,
    generateAsync: mutation.mutateAsync,
    isGenerating: mutation.isPending,
  };
}
