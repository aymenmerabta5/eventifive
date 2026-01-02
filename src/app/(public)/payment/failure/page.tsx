"use client";

import {
  XCircle,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CreditCard,
  HelpCircle,
  Mail,
} from "lucide-react";
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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-pulse-slow absolute -top-24 -right-24 h-96 w-96 rounded-full bg-muted/50 blur-3xl" />
          <div className="animate-pulse-slow animation-delay-1000 absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-muted/30 blur-3xl" />
        </div>

        <Card className="relative w-full max-w-md border-0 bg-card/80 shadow-xl backdrop-blur-sm">
          <CardContent className="flex flex-col items-center gap-6 py-12">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-muted/40" />
              <Loader2 className="relative h-16 w-16 animate-spin text-muted-foreground" />
            </div>
            <div className="space-y-2 text-center">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Loading...
              </h1>
              <p className="text-muted-foreground">
                Please wait while we fetch your payment details.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const troubleshootingSteps = [
    {
      icon: CreditCard,
      text: "Verify your card details and try again",
    },
    {
      icon: AlertTriangle,
      text: "Ensure you have sufficient funds available",
    },
    {
      icon: RefreshCw,
      text: "Try using a different payment method",
    },
    {
      icon: HelpCircle,
      text: "Contact your bank if the issue persists",
    },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-pulse-slow absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-destructive/5 blur-3xl" />
        <div className="animate-pulse-slow animation-delay-1000 absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-muted/30 blur-3xl" />
      </div>

      <Card className="animate-stagger relative w-full max-w-md overflow-hidden border-0 bg-card/90 shadow-2xl backdrop-blur-sm">
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-destructive/80 via-destructive/60 to-muted" />

        <CardHeader className="pb-0 pt-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-50 shadow-lg shadow-red-500/10 dark:from-red-900/30 dark:to-red-800/10">
            <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <Badge
            variant="destructive"
            className="mx-auto mb-4 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
          >
            Payment Failed
          </Badge>
          <CardTitle className="font-display text-3xl tracking-tight">
            Payment Unsuccessful
          </CardTitle>
          <CardDescription className="text-base">
            We couldn&apos;t process your payment. Don&apos;t worry, no charges were
            made.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          {paymentStatus?.failureReason && (
            <div className="rounded-xl border border-red-200/50 bg-red-50/50 p-4 dark:border-red-800/30 dark:bg-red-900/10">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-red-800 dark:text-red-300">
                <AlertTriangle className="h-4 w-4" />
                Error Details
              </div>
              <p className="text-sm text-red-700 dark:text-red-400">
                {paymentStatus.failureReason}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
            <div className="mb-3 text-sm font-medium text-foreground">
              Troubleshooting Steps
            </div>
            <Separator className="mb-3" />
            <ul className="space-y-3">
              {troubleshootingSteps.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                    <step.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="pt-0.5">{step.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
          <Button asChild size="lg" className="w-full shadow-lg shadow-primary/20">
            <Link href="/pricing">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </CardFooter>

        <div className="border-t border-border/50 bg-muted/20 px-6 py-4">
          <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <span>
              Need help?{" "}
              <a
                href="mailto:support@eventifive.com"
                className="font-medium text-primary hover:underline"
              >
                Contact our support team
              </a>
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentFailureContent />
    </Suspense>
  );
}
