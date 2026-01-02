"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { setPasswordSchema } from "@/lib/schemas/schemas";
import { authClient } from "@/lib/auth-client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  AuthFormContainer,
  AuthFormHeader,
} from "@/app/(auth)/_components/AuthFormLayout";
import { cn } from "@/lib/utils";

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-destructive" };
  if (score <= 2)
    return { score, label: "Fair", color: "bg-orange-500 dark:bg-orange-400" };
  if (score <= 3)
    return { score, label: "Good", color: "bg-yellow-500 dark:bg-yellow-400" };
  return { score, label: "Strong", color: "bg-green-500 dark:bg-green-400" };
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 transition-colors",
        met ? "text-green-600 dark:text-green-400" : "text-muted-foreground",
      )}
    >
      {met ? (
        <Check className="size-3" />
      ) : (
        <div className="size-3 rounded-full border border-current" />
      )}
      {text}
    </div>
  );
}

export default function SetResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") as string;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

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
      await authClient.resetPassword(
        {
          newPassword: value.password,
          token: token,
        },
        {
          onSuccess: () => {
            toast.success("Password reset successfully");
            router.push("/login");
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onError: (error: any) => {
            toast.error(
              error.error?.message ||
                "An error occurred while resetting your password",
            );
          },
        },
      );
    },
  });

  return (
    <AuthFormContainer>
      {/* Return to login link */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <Link
          href="/login"
          className="group text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to login</span>
        </Link>
      </motion.div>

      <AuthFormHeader
        icon={ShieldCheck}
        title="Set New Password"
        subtitle="Create a strong password for your account"
        className="mb-5"
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form.Field name="password">
            {(field) => {
              const hasErrors = field.state.meta.errors.length > 0;
              const strength = getPasswordStrength(field.state.value);

              return (
                <div className="space-y-2">
                  <Label
                    htmlFor={field.name}
                    className="text-foreground text-sm font-medium"
                  >
                    New Password
                  </Label>

                  <div
                    className={cn(
                      "group bg-background relative flex items-center overflow-hidden rounded-lg border transition-all duration-200",
                      passwordFocused
                        ? "border-primary ring-primary/20 ring-2"
                        : hasErrors
                          ? "border-destructive"
                          : "border-input hover:border-primary/50",
                    )}
                  >
                    <div className="pointer-events-none flex h-10 items-center pl-3">
                      <Lock
                        className={cn(
                          "size-4 transition-colors",
                          passwordFocused
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                    </div>

                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      value={field.state.value}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => {
                        setPasswordFocused(false);
                        field.handleBlur();
                      }}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="text-foreground placeholder:text-muted-foreground h-10 border-0 bg-transparent pr-10 pl-2 shadow-none ring-0 focus-visible:ring-0"
                      placeholder="Enter new password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground absolute right-3 flex size-8 items-center justify-center rounded-lg transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={showPassword ? "hide" : "show"}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {field.state.value.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 pt-1"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex flex-1 gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={cn(
                                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                                level <= strength.score
                                  ? strength.color
                                  : "bg-muted",
                              )}
                            />
                          ))}
                        </div>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            strength.score <= 1
                              ? "text-destructive"
                              : strength.score <= 2
                                ? "text-orange-500 dark:text-orange-400"
                                : strength.score <= 3
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : "text-green-600 dark:text-green-400",
                          )}
                        >
                          {strength.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <PasswordRequirement
                          met={field.state.value.length >= 8}
                          text="8+ characters"
                        />
                        <PasswordRequirement
                          met={/[A-Z]/.test(field.state.value)}
                          text="Uppercase"
                        />
                        <PasswordRequirement
                          met={/[a-z]/.test(field.state.value)}
                          text="Lowercase"
                        />
                        <PasswordRequirement
                          met={/\d/.test(field.state.value)}
                          text="Number"
                        />
                      </div>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {field.state.meta.errors.map((error) => (
                      <motion.p
                        key={error?.message}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-destructive flex items-center gap-1.5 text-sm"
                      >
                        <X className="size-3.5" />
                        {error?.message}
                      </motion.p>
                    ))}
                  </AnimatePresence>
                </div>
              );
            }}
          </form.Field>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <form.Field name="confirmPassword">
            {(field) => {
              const hasErrors = field.state.meta.errors.length > 0;

              return (
                <div className="space-y-2">
                  <Label
                    htmlFor={field.name}
                    className="text-foreground text-sm font-medium"
                  >
                    Confirm Password
                  </Label>

                  <div
                    className={cn(
                      "group bg-background relative flex items-center overflow-hidden rounded-lg border transition-all duration-200",
                      confirmPasswordFocused
                        ? "border-primary ring-primary/20 ring-2"
                        : hasErrors
                          ? "border-destructive"
                          : "border-input hover:border-primary/50",
                    )}
                  >
                    <div className="pointer-events-none flex h-10 items-center pl-3">
                      <Lock
                        className={cn(
                          "size-4 transition-colors",
                          confirmPasswordFocused
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                    </div>

                    <Input
                      id={field.name}
                      name={field.name}
                      type={showConfirmPassword ? "text" : "password"}
                      value={field.state.value}
                      onFocus={() => setConfirmPasswordFocused(true)}
                      onBlur={() => {
                        setConfirmPasswordFocused(false);
                        field.handleBlur();
                      }}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="text-foreground placeholder:text-muted-foreground h-10 border-0 bg-transparent pr-10 pl-2 shadow-none ring-0 focus-visible:ring-0"
                      placeholder="Confirm your password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-muted-foreground hover:bg-muted hover:text-foreground absolute right-3 flex size-8 items-center justify-center rounded-lg transition-colors"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={showConfirmPassword ? "hide" : "show"}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </button>
                  </div>

                  <AnimatePresence>
                    {field.state.meta.errors.map((error) => (
                      <motion.p
                        key={error?.message}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-destructive flex items-center gap-1.5 text-sm"
                      >
                        <X className="size-3.5" />
                        {error?.message}
                      </motion.p>
                    ))}
                  </AnimatePresence>
                </div>
              );
            }}
          </form.Field>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form.Subscribe>
            {(state) => (
              <Button
                type="submit"
                size="lg"
                className="group bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/25 relative mt-2 h-10 w-full overflow-hidden rounded-lg font-medium shadow-md transition-all duration-300 hover:shadow-lg"
                disabled={!state.canSubmit || state.isSubmitting}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {state.isSubmitting ? (
                    "Updating password..."
                  ) : (
                    <>
                      Update Password
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
                {/* Shine effect on hover */}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              </Button>
            )}
          </form.Subscribe>
        </motion.div>
      </form>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-center gap-1 text-sm">
          <span className="text-muted-foreground">Remember your password?</span>
          <Button
            variant="link"
            asChild
            className="text-primary hover:text-primary/80 h-auto p-0 font-semibold"
          >
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </motion.div>
    </AuthFormContainer>
  );
}
