"use client";

import { motion } from "motion/react";
import { LogIn, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import {
  AuthFormContainer,
  AuthFormHeader,
} from "@/app/(auth)/_components/AuthFormLayout";
import {
  EmailField,
  PasswordField,
  CaptchaField,
  SocialSignIn,
} from "@/app/(auth)/_components/AuthFormFields";
import { useSignInForm } from "./hooks";
import { FormFooter } from "./components";
import type { SignInFormProps } from "./types";

export function SignInForm({ onSwitchToSignUp }: SignInFormProps) {
  const {
    form,
    isSessionPending,
    showPassword,
    isPendingSocial,
    handleCaptchaVerify,
    handleCaptchaError,
    togglePasswordVisibility,
    handleSocialSignIn,
  } = useSignInForm();

  if (isSessionPending) {
    return <Loader />;
  }

  return (
    <AuthFormContainer>
      <AuthFormHeader
        icon={LogIn}
        title="Welcome Back"
        subtitle="Sign in to continue to your account"
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
          <form.Field name="email">
            {(field) => <EmailField field={field} />}
          </form.Field>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <form.Field name="password">
            {(field) => (
              <PasswordField
                field={field}
                showPassword={showPassword}
                onToggleVisibility={togglePasswordVisibility}
              />
            )}
          </form.Field>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CaptchaField
            onVerify={handleCaptchaVerify}
            onError={handleCaptchaError}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
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
                    "Signing in..."
                  ) : (
                    <>
                      Sign In
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

      <SocialSignIn isPending={isPendingSocial} onSignIn={handleSocialSignIn} />

      <FormFooter onSwitchToSignUp={onSwitchToSignUp} />
    </AuthFormContainer>
  );
}
