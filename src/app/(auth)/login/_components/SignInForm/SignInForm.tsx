"use client";

import { LogIn } from "lucide-react";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
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
        subtitle="Sign in to your account"
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
              className="mt-6 h-11 w-full rounded-4xl"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? "Signing in..." : "Sign In"}
            </StatefulButton>
          )}
        </form.Subscribe>
      </form>

      <SocialSignIn isPending={isPendingSocial} onSignIn={handleSocialSignIn} />

      <FormFooter onSwitchToSignUp={onSwitchToSignUp} />
    </AuthFormContainer>
  );
}
