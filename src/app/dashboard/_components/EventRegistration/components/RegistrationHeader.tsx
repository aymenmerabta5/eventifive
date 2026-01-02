"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  IconRefresh,
  IconLoader2,
  IconArrowLeft,
  IconUsers,
} from "@tabler/icons-react";

interface RegistrationHeaderProps {
  onRefresh: () => void;
  onBack: () => void;
  isRefetching: boolean;
}

export function RegistrationHeader({
  onRefresh,
  onBack,
  isRefetching,
}: RegistrationHeaderProps) {
  return (
    <div
      className={cn(
        "border-border/50 relative overflow-hidden rounded-3xl border",
        "from-card via-card to-card/80 bg-gradient-to-br",
      )}
    >
      {/* Pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative gradients */}
      <div className="from-primary/10 via-chart-2/5 pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-gradient-to-br to-transparent blur-3xl" />
      <div className="from-chart-3/10 via-accent/5 pointer-events-none absolute -bottom-20 -left-20 size-48 rounded-full bg-gradient-to-tr to-transparent blur-3xl" />

      {/* Accent strip at top */}
      <div className="from-primary via-chart-2 to-chart-3 absolute top-0 right-0 left-0 h-1 bg-gradient-to-r" />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex size-14 items-center justify-center rounded-2xl",
                "from-primary/10 to-chart-2/10 bg-gradient-to-br",
                "ring-border/50 ring-1",
              )}
            >
              <IconUsers className="text-primary size-7" />
            </div>
            <div>
              <h1 className="font-display text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                Event Registrations
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage participants, communicator applications, and workshop
                proposals.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isRefetching}
              className={cn(
                "border-border/50 gap-2",
                "hover:border-primary/50 hover:bg-primary/5",
              )}
            >
              {isRefetching ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconRefresh className="size-4" />
              )}
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={onBack}
              className={cn(
                "border-border/50 gap-2",
                "hover:border-chart-2/50 hover:bg-chart-2/5",
              )}
            >
              <IconArrowLeft className="size-4" />
              Back to my events
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
