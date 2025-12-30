import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  IconCreditCard,
  IconSparkles,
  IconArrowRight,
} from "@tabler/icons-react";

export function FreePlanState() {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80",
        "transition-all duration-300 hover:shadow-md hover:shadow-primary/5"
      )}
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-accent/20 opacity-50" />

      {/* Decorative elements */}
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 size-24 rounded-full blur-3xl",
          "bg-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        )}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between p-6 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              "bg-secondary text-primary"
            )}
          >
            <IconCreditCard className="size-4" />
          </div>
          <span className="text-sm font-medium text-foreground">
            Subscription
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative space-y-4 p-6 pt-0">
        <div className="space-y-1">
          <h3 className="font-display text-2xl font-bold text-foreground">
            Free Plan
          </h3>
          <p className="text-sm text-muted-foreground">
            Upgrade to unlock premium features
          </p>
        </div>

        {/* Features hint */}
        <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-2.5">
          <IconSparkles className="size-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            Get more events, analytics, and priority support
          </span>
        </div>

        {/* CTA */}
        <Button asChild size="sm" className="w-full gap-2">
          <Link href="/pricing">
            View Plans
            <IconArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
