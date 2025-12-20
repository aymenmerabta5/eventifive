import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FormFooterProps {
  onSwitchToSignUp: () => void;
}

export function FormFooter({ onSwitchToSignUp }: FormFooterProps) {
  return (
    <div className="space-y-3 text-center">
      <Button
        variant="link"
        onClick={onSwitchToSignUp}
        className="text-muted-foreground hover:text-primary h-auto p-0 text-sm"
      >
        Don&apos;t have an account?{" "}
        <span className="text-primary font-medium">Sign Up</span>
      </Button>

      <Button
        variant="link"
        asChild
        className="text-muted-foreground hover:text-primary block h-auto p-0 text-sm"
      >
        <Link href="/reset-password">Forgot password?</Link>
      </Button>
    </div>
  );
}
