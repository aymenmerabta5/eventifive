"use client";

import { useState, useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import { useTurnstile } from "react-turnstile";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema } from "@/lib/schemas/schemas";

export function useResetPasswordForm() {
  const [token, setToken] = useState<string | null>(null);
  const turnstile = useTurnstile();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Please solve the captcha");
        return;
      }
      await authClient.requestPasswordReset(
        {
          email: value.email,
          fetchOptions: {
            headers: {
              "x-captcha-response": token ?? "",
            },
          },
        },
        {
          onSuccess: () => {
            toast.success(
              "If you have an account with us, you will receive a reset password link shortly.",
            );
            form.reset();
            turnstile?.reset();
            setToken(null);
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onError: (error: any) => {
            toast.error(
              error.error?.message ||
                "If you have an account with us, you will receive a reset password link shortly.",
            );
            turnstile?.reset();
            setToken(null);
          },
        },
      );
    },
  });

  const handleCaptchaVerify = useCallback((captchaToken: string) => {
    setToken(captchaToken);
  }, []);

  const handleCaptchaError = useCallback(() => {
    turnstile?.reset();
    setToken(null);
  }, [turnstile]);

  return {
    form,
    handleCaptchaVerify,
    handleCaptchaError,
  };
}
