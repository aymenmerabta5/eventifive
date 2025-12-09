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
    ...orpc.paymentRouter.getStatus.queryOptions({
      input: { paymentId: paymentId ?? "" },
    }),
    enabled: !!paymentId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
          <h1 className="text-2xl font-bold text-foreground">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
            <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Payment Failed</h1>
          <p className="text-muted-foreground">
            Unfortunately, your payment could not be processed. Please try
            again.
          </p>
        </div>

        {paymentStatus?.failureReason && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">
              Error Details
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              {paymentStatus.failureReason}
            </p>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 text-left">
          <h3 className="font-semibold mb-2">What you can do:</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
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

        <p className="text-xs text-muted-foreground">
          Need help?{" "}
          <a href="mailto:support@eventifive.com" className="underline hover:text-foreground">
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
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
      }
    >
      <PaymentFailureContent />
    </Suspense>
  );
}
