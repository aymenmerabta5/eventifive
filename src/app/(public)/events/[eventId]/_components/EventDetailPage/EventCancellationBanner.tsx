"use client";

import { cn } from "@/lib/utils";
import { IconAlertTriangle, IconX } from "@tabler/icons-react";
import { useState } from "react";

interface EventCancellationBannerProps {
  reason?: string | null;
}

export function EventCancellationBanner({
  reason,
}: EventCancellationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "border-destructive/30 border",
        "from-destructive/10 via-destructive/5 to-destructive/10 bg-gradient-to-r",
      )}
    >
      {/* Pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            currentColor 10px,
            currentColor 11px
          )`,
        }}
      />

      <div className="relative flex items-start gap-4 p-5">
        {/* Icon */}
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl",
            "bg-destructive/10 ring-destructive/20 ring-1",
          )}
        >
          <IconAlertTriangle className="text-destructive size-6" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          <h3 className="font-display text-destructive text-lg font-semibold">
            This event has been cancelled
          </h3>
          {reason && (
            <p className="text-muted-foreground text-sm">
              <span className="text-foreground font-medium">Reason:</span>{" "}
              {reason}
            </p>
          )}
        </div>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            "text-muted-foreground hover:text-destructive",
            "hover:bg-destructive/10 transition-colors",
          )}
        >
          <IconX className="size-4" />
          <span className="sr-only">Dismiss</span>
        </button>
      </div>
    </div>
  );
}
