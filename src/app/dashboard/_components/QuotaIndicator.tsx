"use client";

import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  IconCalendarEvent,
  IconInfinity,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react";
import Link from "next/link";

export function QuotaIndicator() {
  const { data: subscription, isLoading } = useQuery(
    orpc.subscription.getUserSubscription.queryOptions({ input: {} }),
  );

  if (isLoading) {
    return (
      <div className="border-border/50 bg-card relative overflow-hidden rounded-xl border p-4">
        {/* Shimmer */}
        <div
          className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          }}
        />
        <div className="flex items-center gap-3">
          <div className="bg-muted/50 size-8 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="bg-muted/60 h-3 w-24 rounded-full" />
            <div className="bg-muted/40 h-2 w-full rounded-full" />
          </div>
        </div>
        <style>{`
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const { quotaUsage, plan } = subscription;
  const isUnlimited = quotaUsage.limit === -1;
  const isAdmin = plan.name === "admin";
  const percentage = isUnlimited
    ? 0
    : Math.min((quotaUsage.used / quotaUsage.limit) * 100, 100);
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && quotaUsage.used >= quotaUsage.limit;

  return (
    <div
      className={cn(
        "group border-border/50 bg-card relative overflow-hidden rounded-xl border p-4",
        "hover:shadow-primary/5 transition-all duration-300 hover:shadow-md",
      )}
    >
      {/* Background accent */}
      <div
        className={cn(
          "absolute inset-0 opacity-[0.03]",
          isAdmin
            ? "from-primary via-chart-2 to-accent bg-gradient-to-br"
            : "from-secondary to-accent bg-gradient-to-br",
        )}
      />

      {/* Decorative corner glow */}
      <div
        className={cn(
          "pointer-events-none absolute -top-4 -right-4 size-16 rounded-full blur-2xl",
          "opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          isAdmin ? "bg-primary/20" : "bg-chart-2/20",
        )}
      />

      <div className="relative">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                "transition-all duration-300",
                isAdmin
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-primary",
              )}
            >
              {isAdmin ? (
                <IconShieldCheck className="size-4" />
              ) : (
                <IconCalendarEvent className="size-4" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-sm font-medium">
                {isAdmin ? "Admin Access" : "Event Quota"}
              </span>
              {isUnlimited && (
                <span className="text-muted-foreground text-[10px]">
                  {quotaUsage.used} active events
                </span>
              )}
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "gap-1 text-xs font-medium",
              isAdmin
                ? "border-primary/30 bg-primary/10 text-primary"
                : isAtLimit
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : isNearLimit
                    ? "border-chart-4/30 bg-chart-4/10 text-chart-4"
                    : "border-secondary bg-secondary text-secondary-foreground",
            )}
          >
            {isAdmin && <IconSparkles className="size-3" />}
            {plan.displayName}
          </Badge>
        </div>

        {/* Content */}
        {isUnlimited ? (
          <div className="bg-secondary/50 flex items-center gap-2 rounded-lg p-2.5">
            <IconInfinity className="text-primary size-4" />
            <span className="text-foreground text-sm font-medium">
              Unlimited events
            </span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Progress info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                <span className="text-foreground font-semibold">
                  {quotaUsage.used}
                </span>{" "}
                / {quotaUsage.limit} events
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  isAtLimit
                    ? "text-destructive"
                    : isNearLimit
                      ? "text-chart-4"
                      : "text-muted-foreground",
                )}
              >
                {Math.round(percentage)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="relative">
              <Progress
                value={percentage}
                className={cn(
                  "bg-muted/50 h-2",
                  isAtLimit
                    ? "[&>div]:bg-destructive"
                    : isNearLimit
                      ? "[&>div]:bg-chart-4"
                      : "[&>div]:from-chart-1 [&>div]:to-chart-2 [&>div]:bg-gradient-to-r",
                )}
              />
            </div>

            {/* Warning messages */}
            {isNearLimit && !isAtLimit && (
              <div className="bg-chart-4/10 text-chart-4 flex items-center gap-2 rounded-lg p-2 text-xs">
                <div className="bg-chart-4 size-1.5 animate-pulse rounded-full" />
                <span>Approaching limit</span>
              </div>
            )}

            {isAtLimit && (
              <div className="bg-destructive/10 flex items-center justify-between rounded-lg p-2">
                <span className="text-destructive text-xs">Quota reached</span>
                <Link
                  href="/pricing"
                  className="text-primary text-xs font-medium underline-offset-2 hover:underline"
                >
                  Upgrade plan
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
