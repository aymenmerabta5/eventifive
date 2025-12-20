"use client";

import { UserPlus } from "lucide-react";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import Loader from "@/components/loader";
import {
  AuthFormContainer,
  AuthFormHeader,
} from "@/app/(auth)/_components/AuthFormLayout";
import {
  NameField,
  EmailField,
  PasswordField,
  CaptchaField,
  SocialSignIn,
} from "@/app/(auth)/_components/AuthFormFields";
import { useSignUpForm } from "./hooks";
import { FormFooter } from "./components";
import type { SignUpFormProps } from "./types";

export function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
  const {
    form,
    isSessionPending,
    showPassword,
    isPendingSocial,
    handleCaptchaVerify,
    handleCaptchaError,
    togglePasswordVisibility,
    handleSocialSignIn,
  } = useSignUpForm();

  if (isSessionPending) {
    return <Loader />;
  }

  return (
    <AuthFormContainer>
      <AuthFormHeader
        icon={UserPlus}
        title="Create Account"
        subtitle="Sign up to get started"
        className="mb-5"
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-5"
      >
        <form.Field name="name">
          {(field) => <NameField field={field} />}
        </form.Field>

        <form.Field name="email">
          {(field) => <EmailField field={field} />}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <PasswordField
              field={field}
              showPassword={showPassword}
              onToggleVisibility={togglePasswordVisibility}
            />
          )}
        </form.Field>

        <CaptchaField
          onVerify={handleCaptchaVerify}
          onError={handleCaptchaError}
        />

        <form.Subscribe>
          {(state) => (
            <StatefulButton
              type="submit"
              className="mt-3 h-11 w-full rounded-4xl"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? "Signing up..." : "Sign Up"}
            </StatefulButton>
          )}
        </form.Subscribe>
      </form>

      <SocialSignIn isPending={isPendingSocial} onSignIn={handleSocialSignIn} />

      <FormFooter onSwitchToSignIn={onSwitchToSignIn} />
    </AuthFormContainer>
  );
}
