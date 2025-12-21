"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import type { JSONContent } from "@tiptap/react";
import { authClient } from "@/lib/auth-client";

type User = typeof authClient.$Infer.Session.user;

export function useProfileForm(user: User, onSessionRefresh: () => void) {
  const router = useRouter();

  const { mutate: updateProfile } = useMutation(
    orpc.profile.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Profile updated successfully");
        // Refresh the session to update user data across the app
        // First bypass cookie cache to get fresh data from server
        await authClient.getSession({
          query: { disableCookieCache: true },
        });
        // Then trigger React re-render via useSession's refetch
        onSessionRefresh();
        router.refresh();
      },
      onError: () => {
        toast.error("Failed to update profile");
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      name: user?.name || "",
      biography: user?.biography as unknown as JSONContent | undefined,
      institution: user?.institution || "",
      researchDomain: user?.researchDomain || "",
    },
    onSubmit: async ({ value }) => {
      try {
        updateProfile({
          name: value.name,
          biography: value.biography,
          institution: value.institution || undefined,
          researchDomain: value.researchDomain || undefined,
        });
      } catch (error) {
        console.error("Failed to update profile:", error);
      }
    },
  });

  return { form };
}
