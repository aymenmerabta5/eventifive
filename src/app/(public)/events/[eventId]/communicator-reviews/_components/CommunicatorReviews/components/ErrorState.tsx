import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ErrorStateProps {
  error: Error | null;
  onRetry: () => void;
  isRetrying: boolean;
}

export function ErrorState({ error, onRetry, isRetrying }: ErrorStateProps) {
  const message =
    error instanceof Error ? error.message : "Please try again later.";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="border-destructive/30 bg-destructive/5 w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="size-5" />
            Could not load communicator registrations
          </CardTitle>
          <CardDescription className="text-destructive/70">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={onRetry} disabled={isRetrying}>
            {isRetrying && <Loader2 className="mr-2 size-4 animate-spin" />}
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
