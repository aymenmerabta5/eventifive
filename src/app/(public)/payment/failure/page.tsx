"use client";

import { XCircle, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");

  const { data: paymentStatus, isLoading } = useQuery({
    ...orpc.payment.getStatus.queryOptions({
      input: { paymentId: paymentId ?? "" },
    }),
    enabled: !!paymentId,
  });

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="text-primary mx-auto h-16 w-16 animate-spin" />
          <h1 className="text-foreground text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
            <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-foreground text-3xl font-bold">Payment Failed</h1>
          <p className="text-muted-foreground">
            Unfortunately, your payment could not be processed. Please try
            again.
          </p>
        </div>

        {paymentStatus?.failureReason && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-left dark:border-red-800 dark:bg-red-900/20">
            <h3 className="mb-1 font-semibold text-red-800 dark:text-red-200">
              Error Details
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              {paymentStatus.failureReason}
            </p>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 text-left">
          <h3 className="mb-2 font-semibold">What you can do:</h3>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>- Check your card details and try again</li>
            <li>- Ensure you have sufficient funds</li>
            <li>- Try a different payment method</li>
            <li>- Contact your bank if the issue persists</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild>
            <Link href="/pricing">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <p className="text-muted-foreground text-xs">
          Need help?{" "}
          <a
            href="mailto:support@eventifive.com"
            className="hover:text-foreground underline"
          >
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-screen items-center justify-center">
          <Loader2 className="text-primary h-16 w-16 animate-spin" />
        </div>
      }
    >
      <PaymentFailureContent />
    </Suspense>
  );
}
