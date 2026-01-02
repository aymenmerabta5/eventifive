"use client";

import { Suspense } from "react";
import Loader from "@/components/loader";
import SetResetPasswordForm from "./_components/set-reset-password-form";

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SetResetPasswordForm />
    </Suspense>
  );
}
