import { Monitor } from "lucide-react";

interface SessionsHeaderProps {
  sessionCount: number;
}

export function SessionsHeader({ sessionCount }: SessionsHeaderProps) {
  return (
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      <Monitor className="h-4 w-4" />
      <span>
        You&apos;re signed in on{" "}
        <span className="text-foreground font-medium">{sessionCount}</span>{" "}
        device{sessionCount === 1 ? "" : "s"}
      </span>
    </div>
  );
}
