"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useCreateConversation } from "@/app/messages/_lib/hooks";

export function useUserProfile(userId: string) {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const createConversation = useCreateConversation();
  const [isContacting, setIsContacting] = useState(false);

  const isOwnProfile = session?.user?.id === userId;

  const handleContact = useCallback(async () => {
    if (isContacting) return;

    try {
      setIsContacting(true);
      const result = await createConversation.mutateAsync({ userId });
      router.push(`/messages?conversationId=${result.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not start the conversation",
      );
    } finally {
      setIsContacting(false);
    }
  }, [isContacting, createConversation, userId, router]);

  const handleShareProfile = useCallback(async () => {
    const profileUrl = `${window.location.origin}/users/${userId}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  }, [userId]);

  return {
    session,
    isOwnProfile,
    isContacting,
    handleContact,
    handleShareProfile,
  };
}
