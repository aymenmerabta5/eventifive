import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="text-primary mx-auto mb-4 h-12 w-12 animate-spin" />
        <p className="text-muted-foreground">Loading events...</p>
      </div>
    </div>
  );
}
