"use client";

import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconCrown,
  IconCalendarEvent,
  IconInfinity,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { formatDateFull } from "@/lib/date";

export function SubscriptionSettings() {
  const { data: subscription, isLoading } = useQuery(
    orpc.subscription.getUserSubscription.queryOptions({ input: {} }),
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-dashed p-8 text-center">
          <div className="bg-muted mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
            <IconCrown className="text-muted-foreground size-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No Active Subscription</h3>
          <p className="text-muted-foreground mb-6">
            Subscribe to a plan to create and manage events.
          </p>
          <Button asChild size="lg">
            <Link href="/pricing">
              <IconCrown className="mr-2 size-4" />
              View Plans
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { plan, price, quotaUsage, status, currentPeriodEnd } = subscription;
  const isUnlimited = quotaUsage.limit === -1;
  const percentage = isUnlimited
    ? 0
    : Math.min((quotaUsage.used / quotaUsage.limit) * 100, 100);
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && quotaUsage.used >= quotaUsage.limit;

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="from-primary/5 to-primary/10 rounded-xl border bg-gradient-to-br p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-xl">
              <IconCrown className="size-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{plan.displayName}</h3>
              <p className="text-muted-foreground text-sm">
                {price.amount.toLocaleString()} {price.currency} /{" "}
                {price.billingPeriod}
              </p>
            </div>
          </div>
          <Badge
            variant={status === "active" ? "default" : "secondary"}
            className="capitalize"
          >
            {status}
          </Badge>
        </div>

        {/* Features */}
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          {plan.features?.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <IconCheck className="text-primary size-4" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Period Info */}
        <div className="flex items-center justify-between border-t pt-4 text-sm">
          <span className="text-muted-foreground">Current period ends</span>
          <span className="font-medium">
            {formatDateFull(currentPeriodEnd)}
          </span>
        </div>
      </div>

      {/* Quota Usage Card */}
      <div className="rounded-xl border p-6">
        <div className="mb-4 flex items-center gap-2">
          <IconCalendarEvent className="text-primary size-5" />
          <h3 className="font-semibold">Event Quota Usage</h3>
        </div>

        {isUnlimited ? (
          <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-4">
            <IconInfinity className="text-primary size-6" />
            <div>
              <p className="font-medium">Unlimited Events</p>
              <p className="text-muted-foreground text-sm">
                You currently have {quotaUsage.used} active event
                {quotaUsage.used !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                {quotaUsage.used} of {quotaUsage.limit} events used
              </span>
              <span className="text-sm font-medium">
                {Math.round(percentage)}%
              </span>
            </div>
            <Progress
              value={percentage}
              className={`h-3 ${isAtLimit ? "[&>div]:bg-destructive" : isNearLimit ? "[&>div]:bg-yellow-500" : ""}`}
            />
            {isAtLimit && (
              <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg p-3 text-sm">
                <IconAlertCircle className="size-4" />
                <span>
                  You&apos;ve reached your quota. Upgrade to create more events.
                </span>
              </div>
            )}
            {isNearLimit && !isAtLimit && (
              <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-600">
                <IconAlertCircle className="size-4" />
                <span>You&apos;re approaching your event limit.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/pricing">
            <IconCrown className="mr-2 size-4" />
            {isAtLimit ? "Upgrade Plan" : "Change Plan"}
          </Link>
        </Button>
      </div>

      {/* Note */}
      <p className="text-muted-foreground text-center text-xs">
        Event quota counts upcoming and ongoing events. Past events don&apos;t
        count against your limit.
      </p>
    </div>
  );
}
