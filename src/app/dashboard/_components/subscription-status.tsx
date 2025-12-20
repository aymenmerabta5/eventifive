"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, Crown, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { formatDateLong } from "@/lib/date";
import { formatPrice } from "@/lib/string";

export function SubscriptionStatus() {
  const {
    data: subscription,
    isLoading,
    error,
  } = useQuery(
    orpc.subscription.getCurrent.queryOptions({
      input: {},
    })
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Subscription</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Subscription</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Failed to load subscription status
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Subscription</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-2xl font-bold">Free Plan</p>
            <p className="text-sm text-muted-foreground">
              Upgrade to unlock premium features
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/pricing">
              View Plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    active: "bg-green-500/10 text-green-600 border-green-200",
    pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    cancelled: "bg-red-500/10 text-red-600 border-red-200",
    expired: "bg-gray-500/10 text-gray-600 border-gray-200",
  };

  const daysRemaining = Math.ceil(
    (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Subscription</CardTitle>
        <Crown className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-2xl font-bold">{subscription.plan.displayName}</p>
            <Badge
              variant="outline"
              className={statusColors[subscription.status]}
            >
              {subscription.status.charAt(0).toUpperCase() +
                subscription.status.slice(1)}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">
              {formatPrice(
                subscription.price.amount,
                subscription.price.currency
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              /{subscription.price.billingPeriod}
            </p>
          </div>
        </div>

        {subscription.status === "active" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {daysRemaining > 0
                ? `Renews in ${daysRemaining} days`
                : "Renewal pending"}
            </span>
          </div>
        )}

        {subscription.status === "pending" && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Your payment is being processed. This may take a few minutes.
            </p>
          </div>
        )}

        {subscription.plan.features && subscription.plan.features.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Your plan includes:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {subscription.plan.features.slice(0, 3).map((feature, i) => (
                <li key={i}>• {feature}</li>
              ))}
              {subscription.plan.features.length > 3 && (
                <li className="text-primary">
                  +{subscription.plan.features.length - 3} more features
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
