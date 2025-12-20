import { Button } from "@/components/ui/button";

interface FormFooterProps {
  onSwitchToSignIn: () => void;
}

export function FormFooter({ onSwitchToSignIn }: FormFooterProps) {
  return (
    <div className="space-y-3 text-center">
      <Button
        variant="link"
        onClick={onSwitchToSignIn}
        className="text-muted-foreground hover:text-primary h-auto p-0 text-sm"
      >
        Already have an account?{" "}
        <span className="text-primary font-medium">Sign In</span>
      </Button>
    </div>
  );
}
