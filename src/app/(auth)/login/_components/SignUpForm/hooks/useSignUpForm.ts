"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useTurnstile } from "react-turnstile";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { signUpSchema } from "@/lib/schemas/schemas";

export function useSignUpForm() {
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
      name: "",
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Please solve the captcha");
        return;
      }
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
          fetchOptions: {
            headers: {
              "x-captcha-response": token || "",
            },
          },
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Sign up successful");
          },
          onError: () => {
            toast.error("An error occurred while signing up");
            turnstile?.reset();
            setToken(null);
          },
        }
      );
    },
    validators: {
      onSubmit: signUpSchema,
    },
  });

  const handleCaptchaVerify = useCallback((captchaToken: string) => {
    setToken(captchaToken);
  }, []);

  const handleCaptchaError = useCallback(() => {
    toast.error("Please solve the captcha");
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
        }
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
