import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

interface ErrorStateProps {
  onRetry: () => void;
  isRetrying: boolean;
}

export function ErrorState({ onRetry, isRetrying }: ErrorStateProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Subscription</CardTitle>
        <CreditCard className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-destructive text-sm">
          Failed to load subscription status
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
        >
          {isRetrying && <Loader2 className="mr-2 size-3 animate-spin" />}
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
