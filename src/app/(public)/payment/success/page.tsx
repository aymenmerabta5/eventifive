"use client";

import { CheckCircle, ArrowRight, Loader2, Sparkles, Receipt } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");

  const { data: paymentStatus, isLoading } = useQuery({
    ...orpc.payment.getStatus.queryOptions({
      input: { paymentId: paymentId ?? "" },
    }),
    enabled: !!paymentId,
    refetchInterval: (query) => {
      if (query.state.data?.status === "paid") {
        return false;
      }
      return 2000;
    },
  });

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-pulse-slow absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="animate-pulse-slow animation-delay-1000 absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <Card className="relative w-full max-w-md border-0 bg-card/80 shadow-xl backdrop-blur-sm">
          <CardContent className="flex flex-col items-center gap-6 py-12">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <Loader2 className="relative h-16 w-16 animate-spin text-primary" />
            </div>
            <div className="space-y-2 text-center">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Confirming your payment...
              </h1>
              <p className="text-muted-foreground">
                Please wait while we verify your transaction.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaid = paymentStatus?.status === "paid";
  const isPending = paymentStatus?.status === "pending";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-pulse-slow absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="animate-pulse-slow animation-delay-1000 absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-chart-2/10 blur-3xl" />
        <div className="animate-float absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-primary/40" />
        <div className="animate-float-delayed absolute top-1/3 right-1/3 h-3 w-3 rounded-full bg-chart-3/30" />
        <div className="animate-float absolute bottom-1/4 right-1/4 h-2 w-2 rounded-full bg-chart-4/40" />
      </div>

      <Card className="animate-stagger relative w-full max-w-md overflow-hidden border-0 bg-card/90 shadow-2xl backdrop-blur-sm">
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-chart-2 to-chart-3" />

        {isPaid ? (
          <>
            <CardHeader className="pb-0 pt-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-lg shadow-emerald-500/20 dark:from-emerald-900/40 dark:to-emerald-800/20">
                <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <Badge className="mx-auto mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <Sparkles className="mr-1 h-3 w-3" />
                Payment Confirmed
              </Badge>
              <CardTitle className="font-display text-3xl tracking-tight">
                Payment Successful!
              </CardTitle>
              <CardDescription className="text-base">
                Thank you for your subscription. You now have full access to all
                features.
              </CardDescription>
            </CardHeader>

            {paymentStatus?.subscription && (
              <CardContent className="pt-6">
                <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    Subscription Details
                  </div>
                  <Separator className="mb-3" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Plan</span>
                      <span className="font-medium text-foreground">
                        {paymentStatus.subscription.planName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold text-primary">
                        {paymentStatus.amount.toLocaleString()}{" "}
                        {paymentStatus.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}

            <CardFooter className="flex flex-col gap-3 pt-2 pb-8">
              <Button asChild size="lg" className="w-full shadow-lg shadow-primary/20">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </CardFooter>
          </>
        ) : isPending ? (
          <>
            <CardHeader className="pb-0 pt-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
              <Badge variant="secondary" className="mx-auto mb-4">
                Processing
              </Badge>
              <CardTitle className="font-display text-2xl tracking-tight">
                Processing Payment...
              </CardTitle>
              <CardDescription className="text-base">
                Your payment is being processed. This page will update
                automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-8">
              <div className="flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 animate-bounce rounded-full bg-primary"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="pb-0 pt-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-lg shadow-emerald-500/20 dark:from-emerald-900/40 dark:to-emerald-800/20">
                <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <Badge className="mx-auto mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <Sparkles className="mr-1 h-3 w-3" />
                Complete
              </Badge>
              <CardTitle className="font-display text-3xl tracking-tight">
                Thank You!
              </CardTitle>
              <CardDescription className="text-base">
                Your payment has been received. Check your email for
                confirmation.
              </CardDescription>
            </CardHeader>

            <CardFooter className="flex flex-col gap-3 pt-6 pb-8">
              <Button asChild size="lg" className="w-full shadow-lg shadow-primary/20">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
