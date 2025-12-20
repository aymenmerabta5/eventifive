import Turnstile from "react-turnstile";
import { env } from "@/env";

interface CaptchaFieldProps {
  onVerify: (token: string) => void;
  onError: () => void;
}

export function CaptchaField({ onVerify, onError }: CaptchaFieldProps) {
  return (
    <div className="flex justify-center">
      <Turnstile
        sitekey={env.NEXT_PUBLIC_CLOUDFLARE_TURNSTYLE_PK}
        onVerify={onVerify}
        onError={onError}
      />
    </div>
  );
}
