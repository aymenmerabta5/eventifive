"use client";

import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { IconCalendarEvent, IconInfinity } from "@tabler/icons-react";
import Link from "next/link";

export function QuotaIndicator() {
  const { data: subscription, isLoading } = useQuery(
    orpc.subscription.getUserSubscription.queryOptions({ input: {} }),
  );

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-lg border p-3">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="mt-2 h-2 w-full rounded bg-muted" />
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const { quotaUsage, plan } = subscription;
  const isUnlimited = quotaUsage.limit === -1;
  const percentage = isUnlimited
    ? 0
    : Math.min((quotaUsage.used / quotaUsage.limit) * 100, 100);
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && quotaUsage.used >= quotaUsage.limit;

  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconCalendarEvent className="size-4 text-primary" />
          <span>Event Quota</span>
        </div>
        <Badge
          variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "outline"}
          className="text-xs"
        >
          {plan.displayName}
        </Badge>
      </div>

      {isUnlimited ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconInfinity className="size-4" />
          <span>Unlimited events</span>
          <span className="text-foreground font-medium">
            ({quotaUsage.used} active)
          </span>
        </div>
      ) : (
        <>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {quotaUsage.used} / {quotaUsage.limit} events
            </span>
            {isAtLimit && (
              <Link
                href="/pricing"
                className="text-xs text-primary hover:underline"
              >
                Upgrade
              </Link>
            )}
          </div>
          <Progress
            value={percentage}
            className={`h-2 ${isAtLimit ? "[&>div]:bg-destructive" : isNearLimit ? "[&>div]:bg-yellow-500" : ""}`}
          />
          {isNearLimit && !isAtLimit && (
            <p className="mt-1 text-xs text-yellow-600">
              You&apos;re approaching your limit
            </p>
          )}
          {isAtLimit && (
            <p className="mt-1 text-xs text-destructive">
              Quota reached.{" "}
              <Link href="/pricing" className="underline">
                Upgrade
              </Link>{" "}
              to create more events.
            </p>
          )}
        </>
      )}
    </div>
  );
}
