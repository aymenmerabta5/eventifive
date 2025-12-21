"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useTurnstile } from "react-turnstile";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { signInSchema } from "@/lib/schemas/schemas";

export function useSignInForm() {
  const router = useRouter();
  const turnstile = useTurnstile();
  const { isPending: isSessionPending } = authClient.useSession();

  const [token, setToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPendingSocial, startTransitionSocial] = useTransition();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Please solve the captcha");
        return;
      }
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
          fetchOptions: {
            headers: {
              "x-captcha-response": token ?? "",
            },
          },
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Sign in successful");
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onError: (error: any) => {
            toast.error(
              error.error?.message || "An error occurred while signing in",
            );
            turnstile?.reset();
            setToken(null);
          },
        },
      );
    },
    validators: {
      onSubmit: signInSchema,
    },
  });

  const handleCaptchaVerify = useCallback((captchaToken: string) => {
    setToken(captchaToken);
  }, []);

  const handleCaptchaError = useCallback(() => {
    turnstile?.reset();
    setToken(null);
  }, [turnstile]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSocialSignIn = useCallback(() => {
    startTransitionSocial(async () => {
      await authClient.signIn.social(
        {
          provider: "google",
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    });
  }, [router]);

  return {
    form,
    isSessionPending,
    showPassword,
    isPendingSocial,
    handleCaptchaVerify,
    handleCaptchaError,
    togglePasswordVisibility,
    handleSocialSignIn,
  };
}
