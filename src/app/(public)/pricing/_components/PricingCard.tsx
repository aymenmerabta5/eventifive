"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { PlanOutput } from "@/lib/schemas/payment";

function formatPrice(amount: number): string {
  return amount.toLocaleString("fr-DZ");
}

function PricingCardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="relative flex animate-pulse flex-col">
          <CardHeader className="space-y-4">
            <div className="bg-muted h-8 w-24 rounded" />
            <div className="bg-muted h-16 rounded" />
            <div className="bg-muted h-12 w-32 rounded" />
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="bg-muted h-10 rounded" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="bg-muted h-6 rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function PricingCard() {
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  // Fetch plans from database
  const {
    data: plans,
    isLoading,
    error,
  } = useQuery(
    orpc.subscription.listPlans.queryOptions({
      input: { includeInactive: false },
    }),
  );

  // Create checkout mutation
  const createCheckout = useMutation({
    mutationFn: async (priceId: string) => {
      const result = await orpc.payment.createCheckout.call({
        priceId,
      });
      return result;
    },
    onSuccess: (data) => {
      // Redirect to Chargily checkout page
      window.location.href = data.checkoutUrl;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout");
      setLoadingPriceId(null);
    },
  });

  const handleSubscribe = async (plan: PlanOutput) => {
    const price = plan.prices.find(
      (p) => p.billingPeriod === (isYearly ? "yearly" : "monthly"),
    );

    if (!price) {
      toast.error("Price not available for this billing period");
      return;
    }

    // Check if price is synced to Chargily
    if (!price.chargilyPriceId) {
      toast.error("This plan is not yet available for purchase");
      return;
    }

    // If not logged in, redirect to login with return URL
    if (!session?.user) {
      const returnUrl = `/pricing?priceId=${price.id}&yearly=${isYearly}`;
      router.push(`/login?returnTo=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // Create checkout
    setLoadingPriceId(price.id);
    createCheckout.mutate(price.id);
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-7 p-4">
        <div className="flex items-center justify-center gap-4">
          <div className="bg-muted h-12 w-48 animate-pulse rounded-full" />
        </div>
        <PricingCardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl p-4 text-center">
        <p className="text-destructive">
          Failed to load pricing plans. Please try again later.
        </p>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="mx-auto w-full max-w-7xl p-4 text-center">
        <p className="text-muted-foreground">
          No pricing plans available at the moment.
        </p>
      </div>
    );
  }

  // Sort plans by sortOrder
  const sortedPlans = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);

  // Mark middle plan as popular (if 3 plans)
  const popularIndex = sortedPlans.length === 3 ? 1 : -1;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 p-4">
      <div className="flex items-center justify-center gap-4">
        <div className="bg-card border-border relative inline-flex items-center rounded-full border p-1 shadow-sm">
          <motion.div
            className="bg-primary absolute h-[calc(100%-8px)] rounded-full shadow-sm"
            initial={false}
            animate={{
              x: isYearly ? "calc(100% + 8px)" : "4px",
              width: isYearly ? "88px" : "88px",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button
            onClick={() => setIsYearly(false)}
            className={`relative z-10 rounded-full px-6 py-2 text-sm font-medium transition-colors ${
              !isYearly
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`relative z-10 rounded-full px-6 py-2 text-sm font-medium transition-colors ${
              isYearly
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>
      <div className="text-center">
        <span className="text-muted-foreground text-sm">
          Save up to 25% by paying yearly
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {sortedPlans.map((plan, index) => {
          const isPopular = index === popularIndex;
          const price = plan.prices.find(
            (p) => p.billingPeriod === (isYearly ? "yearly" : "monthly"),
          );
          const isLoading = loadingPriceId === price?.id;
          const isAvailable = !!price?.chargilyPriceId;

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                isPopular
                  ? "border-primary bg-background/70 scale-105 shadow-lg backdrop-blur-sm"
                  : "border-border"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 right-6">
                  <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-semibold">
                    Popular
                  </span>
                </div>
              )}

              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl font-bold">
                  {plan.displayName}
                </CardTitle>
                <p className="text-muted-foreground min-h-[60px] text-sm">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    {price ? formatPrice(price.amount) : "N/A"}
                  </span>
                  <span className="text-muted-foreground text-2xl font-medium">
                    DA
                  </span>
                  {isYearly ? (
                    <span className="text-muted-foreground">/year</span>
                  ) : (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-6">
                <Button
                  variant={isPopular ? "default" : "outline"}
                  className={`w-full ${
                    isPopular ? "bg-primary hover:bg-primary/90" : ""
                  }`}
                  onClick={() => handleSubscribe(plan)}
                  disabled={isLoading || !isAvailable}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : !isAvailable ? (
                    "Coming Soon"
                  ) : (
                    "Get Started"
                  )}
                </Button>

                <div className="space-y-3">
                  {plan.features?.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="bg-primary/10 mt-0.5 rounded-full p-1">
                        <Check className="text-primary h-4 w-4" />
                      </div>
                      <span className="text-foreground flex-1 text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
