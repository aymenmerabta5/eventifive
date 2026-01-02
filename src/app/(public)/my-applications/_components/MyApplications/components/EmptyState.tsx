import Link from "next/link";
import { IconFileOff, IconCalendarEvent } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <div className="bg-primary/10 absolute inset-0 scale-150 rounded-full blur-2xl" />
        <div className="border-border/50 bg-card relative flex size-24 items-center justify-center rounded-3xl border">
          <IconFileOff className="text-muted-foreground size-12" />
        </div>
      </div>
      <h3 className="mb-2 text-xl font-semibold">No Applications Yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        You haven&apos;t submitted any communicator papers or workshop proposals
        yet. Browse events to find opportunities!
      </p>
      <Button asChild className="gap-2 rounded-full px-6">
        <Link href="/events">
          <IconCalendarEvent className="size-4" />
          Browse Events
        </Link>
      </Button>
    </div>
  );
}
