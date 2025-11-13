"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { setPasswordSchema } from "@/lib/schemas/schemas";
import { authClient } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Key } from "lucide-react";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import ReturnBack from "@/components/return-back";

export default function SetResetPasswordForm() {
    const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") as string;

  useEffect(() => {
    if (!token) {
        router.push("/reset-password");
        toast.error("Provide a token to reset your password");
    }
  }, [token, router]);

  const form = useForm({
    defaultState: {
      values: {
        password: "",
        confirmPassword: "",
      },
    },
    validators: {
      onSubmit: setPasswordSchema,
    },
    onSubmit: async ({ value }) => {
        await authClient.resetPassword({
            newPassword: value.password,
            token: token,
        }, {
            onSuccess: () => {
                toast.success("Password reset successfully");
                router.push("/login");
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: (error: any) => {
                toast.error(error.error?.message || "An error occurred while resetting your password");
            }
        })
    },
  });

  return (
    <div className="relative flex mt-12 items-center justify-center p-4">
      <ReturnBack />
      <div className="relative w-full max-w-lg">
        <div
          className="absolute inset-0 -z-10 rounded-xl opacity-10 blur-3xl dark:opacity-40"
          style={{
            background: "oklch(var(--primary))",
            transform: "scale(1.15)",
          }}
        />
        <Card className="border-primary/20 dark:border-primary/40 bg-card/95 relative w-full p-8 shadow-lg backdrop-blur-md dark:shadow-[0_0_60px_rgba(139,92,246,0.5),0_0_120px_rgba(139,92,246,0.3),0_25px_80px_rgba(0,0,0,0.2),0_10px_30px_rgba(0,0,0,0.3)]">
          <div className="mb-8 flex flex-col items-center">
            <Key className="text-primary mb-3 size-8" />
            <h1 className="text-foreground font-display text-3xl font-semibold tracking-tight">
              Set you new password
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              you are about to set your new password to your account
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-5"
          >
            <form.Field name="password">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="h-11"
                    placeholder="Enter your password"
                  />
                  {field.state.meta.errors.map((error) => (
                    <p
                      key={error?.message}
                      className="text-destructive text-sm"
                    >
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Field name="confirmPassword">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="h-11"
                    placeholder="Confirm your password"
                  />
                  {field.state.meta.errors.map((error) => (
                    <p
                      key={error?.message}
                      className="text-destructive text-sm"
                    >
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Subscribe>
              {(state) => (
                <StatefulButton
                  type="submit"
                  className="mt-6 h-11 w-full rounded-4xl"
                  disabled={!state.canSubmit || state.isSubmitting}
                >
                  {state.isSubmitting ? "Setting your password..." : "Set you password"}
                </StatefulButton>
              )}
            </form.Subscribe>
          </form>
        </Card>
      </div>
    </div>
  );
}