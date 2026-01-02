"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { PlanOutput } from "@/lib/schemas/payment";
import { cn } from "@/lib/utils";
import {
  IconCheck,
  IconLoader2,
  IconSparkles,
  IconArrowRight,
  IconCrown,
} from "@tabler/icons-react";

function formatPrice(amount: number): string {
  return amount.toLocaleString("fr-DZ");
}

function PricingCardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "border-border/60 bg-card/50 relative flex flex-col rounded-2xl border p-6 backdrop-blur-sm",
            i === 2 && "md:-mt-4 md:mb-4",
          )}
        >
          <div className="space-y-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-32" />
          </div>
          <div className="mt-6 space-y-6">
            <Skeleton className="h-12 w-full rounded-full" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="size-6 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
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

    if (!price.chargilyPriceId) {
      toast.error("This plan is not yet available for purchase");
      return;
    }

    if (!session?.user) {
      const returnUrl = `/pricing?priceId=${price.id}&yearly=${isYearly}`;
      router.push(`/login?returnTo=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setLoadingPriceId(price.id);
    createCheckout.mutate(price.id);
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 sm:px-6">
        {/* Toggle skeleton */}
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-52 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </div>
        <PricingCardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 text-center sm:px-6">
        <div className="border-destructive/20 bg-destructive/5 rounded-2xl border p-8">
          <p className="text-destructive">
            Failed to load pricing plans. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 text-center sm:px-6">
        <div className="border-border/60 bg-card/50 rounded-2xl border p-8">
          <p className="text-muted-foreground">
            No pricing plans available at the moment.
          </p>
        </div>
      </div>
    );
  }

  const sortedPlans = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);
  const popularIndex = sortedPlans.length === 3 ? 1 : -1;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 sm:px-6">
      {/* Billing toggle */}
      <div className="flex flex-col items-center gap-4">
        <div className="border-border/60 bg-card/80 relative inline-flex items-center rounded-full border p-1.5 shadow-sm backdrop-blur-sm">
          <motion.div
            className="bg-primary absolute h-[calc(100%-12px)] rounded-full shadow-lg"
            initial={false}
            animate={{
              x: isYearly ? "calc(100% + 6px)" : "6px",
              width: "88px",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button
            onClick={() => setIsYearly(false)}
            className={cn(
              "relative z-10 rounded-full px-6 py-2.5 text-sm font-medium transition-colors",
              !isYearly
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={cn(
              "relative z-10 rounded-full px-6 py-2.5 text-sm font-medium transition-colors",
              isYearly
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Yearly
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isYearly ? "yearly" : "monthly"}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2"
          >
            {isYearly && (
              <span className="bg-chart-4/10 text-chart-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium">
                <IconSparkles className="size-3" />
                Save up to 25%
              </span>
            )}
            <span className="text-muted-foreground text-sm">
              {isYearly ? "Billed annually" : "Billed monthly"}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
        {sortedPlans.map((plan, index) => {
          const isPopular = index === popularIndex;
          const price = plan.prices.find(
            (p) => p.billingPeriod === (isYearly ? "yearly" : "monthly"),
          );
          const isButtonLoading = loadingPriceId === price?.id;
          const isAvailable = !!price?.chargilyPriceId;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn("group relative", isPopular && "md:-mt-4 md:mb-4")}
            >
              <Card
                className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300",
                  isPopular
                    ? "border-primary from-primary/5 to-background shadow-primary/10 bg-gradient-to-b shadow-xl"
                    : "border-border/60 bg-card/50 hover:border-primary/30 hover:shadow-lg",
                )}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="bg-primary text-primary-foreground absolute top-6 -right-12 rotate-45 px-12 py-1.5 text-xs font-semibold shadow-md">
                    Popular
                  </div>
                )}

                <CardHeader className="space-y-4 pb-4">
                  <div className="flex items-center gap-2">
                    {isPopular && (
                      <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                        <IconCrown className="text-primary size-4" />
                      </div>
                    )}
                    <CardTitle className="text-foreground text-xl font-bold">
                      {plan.displayName}
                    </CardTitle>
                  </div>

                  <p className="text-muted-foreground min-h-[48px] text-sm leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="pt-2">
                    <div className="flex items-baseline gap-1">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={`${plan.id}-${isYearly}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="text-foreground text-4xl font-bold tracking-tight"
                        >
                          {price ? formatPrice(price.amount) : "N/A"}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-muted-foreground text-lg font-medium">
                        DA
                      </span>
                      <span className="text-muted-foreground text-sm">
                        /{isYearly ? "year" : "month"}
                      </span>
                    </div>
                    {isYearly && price && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        ≈ {formatPrice(Math.round(price.amount / 12))} DA/month
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col space-y-6 pt-0">
                  {/* CTA Button */}
                  <Button
                    size="lg"
                    variant={isPopular ? "default" : "outline"}
                    className={cn(
                      "group/btn w-full rounded-full font-semibold transition-all duration-300",
                      isPopular
                        ? "shadow-primary/20 hover:shadow-primary/30 shadow-lg hover:shadow-xl"
                        : "hover:border-primary hover:bg-primary hover:text-primary-foreground hover:dark:text-primary border-2",
                    )}
                    onClick={() => handleSubscribe(plan)}
                    disabled={isButtonLoading || !isAvailable}
                  >
                    {isButtonLoading ? (
                      <>
                        <IconLoader2 className="mr-2 size-4 animate-spin" />
                        Processing...
                      </>
                    ) : !isAvailable ? (
                      "Coming Soon"
                    ) : (
                      <>
                        Get Started
                        <IconArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </>
                    )}
                  </Button>

                  {/* Features list */}
                  <div className="flex-1 space-y-3">
                    <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                      What&apos;s included
                    </p>
                    {plan.features?.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.3 + featureIndex * 0.05,
                        }}
                        className="flex items-start gap-3"
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                            isPopular
                              ? "bg-primary/20 text-primary"
                              : "bg-chart-4/10 text-chart-4",
                          )}
                        >
                          <IconCheck className="size-3" strokeWidth={3} />
                        </div>
                        <span className="text-foreground/80 flex-1 text-sm">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>

                {/* Decorative gradient */}
                {isPopular && (
                  <div className="bg-primary/10 absolute -bottom-20 -left-20 size-40 rounded-full blur-3xl" />
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
