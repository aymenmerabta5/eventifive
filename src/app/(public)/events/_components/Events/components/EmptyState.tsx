"use client";

import { Button } from "@/components/ui/button";
import { IconCalendarOff, IconRefresh } from "@tabler/icons-react";
import Link from "next/link";

export function EmptyState() {
  return (
    <div className="min-h-screen">
      {/* Header area with gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5" />
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-gradient-to-br from-primary/10 to-secondary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 size-[500px] rounded-full bg-gradient-to-tl from-accent/10 to-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center text-center max-w-md">
          {/* Icon */}
          <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-muted/50">
            <IconCalendarOff className="size-10 text-muted-foreground" />
          </div>

          {/* Title */}
          <h2 className="mb-3 text-2xl font-bold text-foreground">
            No Events Found
          </h2>

          {/* Description */}
          <p className="mb-8 text-muted-foreground leading-relaxed">
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
