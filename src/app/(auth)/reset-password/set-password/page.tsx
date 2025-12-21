import Loader from "@/components/loader";
import { Suspense } from "react";
import SetResetPasswordForm from "./_components/set-reset-password-form";

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SetResetPasswordForm />
    </Suspense>
  );
}
