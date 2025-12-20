"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import type { JSONContent } from "@tiptap/react";
import type { authClient } from "@/lib/auth-client";

type User = typeof authClient.$Infer.Session.user;

export function useProfileForm(user: User) {
  const { mutate: updateProfile } = useMutation(
    orpc.profile.update.mutationOptions({
      onSuccess: () => {
        toast.success("Profile updated successfully");
      },
      onError: () => {
        toast.error("Failed to update profile");
      },
    })
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
