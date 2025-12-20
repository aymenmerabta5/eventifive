import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar } from "lucide-react";
import { formatPrice } from "@/lib/string";
import { STATUS_STYLES, MAX_FEATURES_DISPLAYED } from "../constants";
import type { SubscriptionData, SubscriptionStatusType } from "../types";

interface ActiveSubscriptionCardProps {
	subscription: SubscriptionData;
	daysRemaining: number;
}

export function ActiveSubscriptionCard({ subscription, daysRemaining }: ActiveSubscriptionCardProps) {
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
							className={STATUS_STYLES[subscription.status as SubscriptionStatusType]}
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
							{subscription.plan.features.slice(0, MAX_FEATURES_DISPLAYED).map((feature, i) => (
								<li key={i}>• {feature}</li>
							))}
							{subscription.plan.features.length > MAX_FEATURES_DISPLAYED && (
								<li className="text-primary">
									+{subscription.plan.features.length - MAX_FEATURES_DISPLAYED} more features
								</li>
							)}
						</ul>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
