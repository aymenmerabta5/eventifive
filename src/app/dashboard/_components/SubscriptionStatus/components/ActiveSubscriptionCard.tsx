import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  IconCrown,
  IconCalendar,
  IconCheck,
  IconClock,
} from "@tabler/icons-react";
import { formatPrice } from "@/lib/string";
import { STATUS_STYLES, MAX_FEATURES_DISPLAYED } from "../constants";
import type { SubscriptionData, SubscriptionStatusType } from "../types";

interface ActiveSubscriptionCardProps {
  subscription: SubscriptionData;
  daysRemaining: number;
}

export function ActiveSubscriptionCard({
  subscription,
  daysRemaining,
}: ActiveSubscriptionCardProps) {
  const isPending = subscription.status === "pending";

  return (
    <div
      className={cn(
        "group border-border/50 relative overflow-hidden rounded-2xl border",
        "from-card via-card to-card/80 bg-gradient-to-br",
        "hover:shadow-primary/5 transition-all duration-300 hover:shadow-md",
      )}
    >
      {/* Premium gradient overlay */}
      <div className="from-primary/5 to-chart-2/5 absolute inset-0 bg-gradient-to-br via-transparent opacity-60" />

      {/* Decorative glow */}
      <div
        className={cn(
          "pointer-events-none absolute -top-8 -right-8 size-32 rounded-full blur-3xl",
          "bg-primary/15 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
        )}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between p-6 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              "bg-primary/10 text-primary",
            )}
          >
            <IconCrown className="size-4" />
          </div>
          <span className="text-foreground text-sm font-medium">
            Subscription
          </span>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium",
            STATUS_STYLES[subscription.status as SubscriptionStatusType],
          )}
        >
          {subscription.status.charAt(0).toUpperCase() +
            subscription.status.slice(1)}
        </Badge>
      </div>

      {/* Content */}
      <div className="relative space-y-4 p-6 pt-0">
        {/* Plan and price */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-foreground text-2xl font-bold">
              {subscription.plan.displayName}
            </h3>
          </div>
          <div className="text-right">
            <p className="font-display text-foreground text-lg font-semibold">
              {formatPrice(
                subscription.price.amount,
                subscription.price.currency,
              )}
            </p>
            <p className="text-muted-foreground text-xs">
              /{subscription.price.billingPeriod}
            </p>
          </div>
        </div>

        {/* Status messages */}
        {subscription.status === "active" && (
          <div className="bg-secondary/50 flex items-center gap-2 rounded-lg p-2.5">
            <IconCalendar className="text-primary size-4" />
            <span className="text-foreground text-sm">
              {daysRemaining > 0 ? (
                <>
                  Renews in{" "}
                  <span className="font-medium">{daysRemaining} days</span>
                </>
              ) : (
                "Renewal pending"
              )}
            </span>
          </div>
        )}

        {isPending && (
          <div className="bg-chart-4/10 flex items-center gap-2 rounded-lg p-2.5">
            <IconClock className="text-chart-4 size-4 animate-pulse" />
            <span className="text-chart-4 text-sm">
              Payment is being processed...
            </span>
          </div>
        )}

        {/* Features */}
        {subscription.plan.features &&
          subscription.plan.features.length > 0 && (
            <div className="border-border/30 border-t pt-3">
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                Your plan includes:
              </p>
              <ul className="space-y-1.5">
                {subscription.plan.features
                  .slice(0, MAX_FEATURES_DISPLAYED)
                  .map((feature, i) => (
                    <li
                      key={i}
                      className="text-muted-foreground flex items-center gap-2 text-xs"
                    >
                      <div className="bg-primary/10 flex size-4 items-center justify-center rounded-full">
                        <IconCheck className="text-primary size-2.5" />
                      </div>
                      {feature}
                    </li>
                  ))}
                {subscription.plan.features.length > MAX_FEATURES_DISPLAYED && (
                  <li className="text-primary text-xs font-medium">
                    +
                    {subscription.plan.features.length - MAX_FEATURES_DISPLAYED}{" "}
                    more features
                  </li>
                )}
              </ul>
            </div>
          )}
      </div>
    </div>
  );
}
