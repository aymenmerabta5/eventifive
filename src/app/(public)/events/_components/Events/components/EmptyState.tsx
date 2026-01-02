"use client";

import { Button } from "@/components/ui/button";
import { IconCalendarOff, IconRefresh } from "@tabler/icons-react";
import Link from "next/link";

export function EmptyState() {
  return (
    <div className="min-h-screen">
      {/* Header area with gradient */}
      <div className="relative overflow-hidden">
        <div className="from-primary/5 via-secondary/10 to-accent/5 absolute inset-0 bg-gradient-to-br" />
        <div className="from-primary/10 to-secondary/5 absolute -top-24 -left-24 size-96 rounded-full bg-gradient-to-br blur-3xl" />
        <div className="from-accent/10 to-primary/5 absolute -right-32 -bottom-32 size-[500px] rounded-full bg-gradient-to-tl blur-3xl" />
        <div className="from-background absolute right-0 bottom-0 left-0 h-24 bg-gradient-to-t to-transparent" />
      </div>

      {/* Content */}
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex max-w-md flex-col items-center text-center">
          {/* Icon */}
          <div className="bg-muted/50 mb-6 flex size-20 items-center justify-center rounded-3xl">
            <IconCalendarOff className="text-muted-foreground size-10" />
          </div>

          {/* Title */}
          <h2 className="text-foreground mb-3 text-2xl font-bold">
            No Events Found
          </h2>

          {/* Description */}
          <p className="text-muted-foreground mb-8 leading-relaxed">
            There are no events available at the moment. Check back later or
            explore other sections of our platform.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <IconRefresh className="size-4" />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
