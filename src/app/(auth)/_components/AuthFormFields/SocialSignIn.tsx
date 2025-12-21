import { Activity } from "react";
import { Loader2 } from "lucide-react";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { Button } from "@/components/ui/button";

interface SocialSignInProps {
  isPending: boolean;
  onSignIn: () => void;
}

export function SocialSignIn({ isPending, onSignIn }: SocialSignInProps) {
  return (
    <>
      <div className="relative my-6">
        <hr className="border-border" />
        <span className="bg-card text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-sm">
          Or
        </span>
      </div>

      <Button variant="outline" className="rounded-3xl px-4" onClick={onSignIn}>
        <Activity mode={isPending ? "visible" : "hidden"}>
          <Loader2 className="size-4 animate-spin" />
        </Activity>
        <Activity mode={isPending ? "hidden" : "visible"}>
          <SiGoogle className="me-3" />
        </Activity>
        Sign in with Google
      </Button>
    </>
  );
}
