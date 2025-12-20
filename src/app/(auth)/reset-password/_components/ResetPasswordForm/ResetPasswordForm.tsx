"use client";

import { Key } from "lucide-react";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
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
        icon={Key}
        title="Reset Password"
        subtitle="Enter your email to reset your password"
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-5"
      >
        <form.Field name="email">
          {(field) => <EmailField field={field} />}
        </form.Field>

        <CaptchaField
          onVerify={handleCaptchaVerify}
          onError={handleCaptchaError}
        />

        <StatefulButton
          type="submit"
          className="mt-6 h-11 w-full rounded-4xl"
          disabled={!form.state.canSubmit || form.state.isSubmitting}
        >
          {form.state.isSubmitting ? "Sending..." : "Send Reset Link"}
        </StatefulButton>
      </form>

      <FormFooter />
    </AuthFormContainer>
  );
}
