"use client";

import { motion } from "motion/react";
import { KeyRound, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AuthFormContainer,
  AuthFormHeader,
} from "@/app/(auth)/_components/AuthFormLayout";
import {
  EmailField,
  CaptchaField,
} from "@/app/(auth)/_components/AuthFormFields";
import { useResetPasswordForm } from "./hooks";
import { FormFooter } from "./components";

export function ResetPasswordForm() {
  const { form, handleCaptchaVerify, handleCaptchaError } =
    useResetPasswordForm();

  return (
    <AuthFormContainer>
      <AuthFormHeader
        icon={KeyRound}
        title="Reset Password"
        subtitle="Enter your email to receive a reset link"
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
          <CaptchaField
            onVerify={handleCaptchaVerify}
            onError={handleCaptchaError}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            type="submit"
            size="lg"
            className="group bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/25 relative mt-2 h-10 w-full overflow-hidden rounded-lg font-medium shadow-md transition-all duration-300 hover:shadow-lg"
            disabled={!form.state.canSubmit || form.state.isSubmitting}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {form.state.isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </span>
            {/* Shine effect on hover */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </Button>
        </motion.div>
      </form>

      <FormFooter />
    </AuthFormContainer>
  );
}
