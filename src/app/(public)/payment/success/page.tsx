"use client";

import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
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
      // Keep polling until payment is confirmed
      if (query.state.data?.status === "paid") {
        return false;
      }
      return 2000;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
          <h1 className="text-2xl font-bold text-foreground">
            Confirming your payment...
          </h1>
          <p className="text-muted-foreground">
            Please wait while we verify your payment.
          </p>
        </div>
      </div>
    );
  }

  const isPaid = paymentStatus?.status === "paid";
  const isPending = paymentStatus?.status === "pending";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {isPaid ? (
          <>
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Payment Successful!
              </h1>
              <p className="text-muted-foreground">
                Thank you for your subscription. You now have full access to all
                features.
              </p>
            </div>
            {paymentStatus?.subscription && (
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <h3 className="font-semibold mb-2">Subscription Details</h3>
                <p className="text-sm text-muted-foreground">
                  Plan: {paymentStatus.subscription.planName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Amount: {(paymentStatus.amountCents / 100).toLocaleString()}{" "}
                  {paymentStatus.currency}
                </p>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </>
        ) : isPending ? (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Processing Payment...
              </h1>
              <p className="text-muted-foreground">
                Your payment is being processed. This page will update
                automatically.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Thank You!
              </h1>
              <p className="text-muted-foreground">
                Your payment has been received. Check your email for
                confirmation.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
