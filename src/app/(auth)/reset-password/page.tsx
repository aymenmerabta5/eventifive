"use client";

import ReturnBack from "@/components/return-back";
import { Suspense } from "react";
import ResetPasswordForm from "./_components/reset-password-form";
import Loader from "@/components/loader";

export default function ResetPasswordPage() {
  

  return (
    <>
      <ReturnBack />
      <Suspense fallback={<Loader />}>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
