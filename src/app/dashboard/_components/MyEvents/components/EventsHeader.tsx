import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2 } from "lucide-react";

interface EventsHeaderProps {
  onRefresh: () => void;
  isRefetching: boolean;
}

export function EventsHeader({ onRefresh, isRefetching }: EventsHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Events</h1>
          <p className="text-muted-foreground">
            Review every event created by you.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={onRefresh} disabled={isRefetching}>
            {isRefetching ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 size-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
