"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { orpc } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconCurrencyDollar,
  IconCheck,
  IconClock,
  IconLogin,
  IconLoader2,
  IconSparkles,
  IconTicket,
  IconShieldCheck,
  IconArrowRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface RegistrationStatus {
  isRegistered: boolean;
  registrationId: number | null;
  paymentStatus: "unpaid" | "pending" | "paid" | "refunded" | null;
  roleAtEvent: string | null;
  registeredAt: Date | null;
}

interface EventRegistrationSectionProps {
  eventId: string;
  priceAmount: number;
  priceCurrency: string;
  eventTitle: string;
  isAuthenticated: boolean;
  registrationStatus: RegistrationStatus | null;
}

export function EventRegistrationSection({
  eventId,
  priceAmount,
  priceCurrency,
  eventTitle,
  isAuthenticated,
  registrationStatus,
}: EventRegistrationSectionProps) {
  const router = useRouter();

  const isFreeEvent = priceAmount <= 0;
  const priceDisplay = isFreeEvent
    ? "Free"
    : `${priceAmount.toLocaleString()} ${priceCurrency}`;

  const isRegistered = registrationStatus?.isRegistered ?? false;
  const paymentStatus = registrationStatus?.paymentStatus;
  const isPaid = paymentStatus === "paid";
  const isPending = paymentStatus === "pending";

  // Free event registration mutation
  const registerMutation = useMutation(
    orpc.events.register.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message);
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to register for event");
      },
    }),
  );

  // Paid event checkout mutation
  const checkoutMutation = useMutation(
    orpc.payment.createEventCheckout.mutationOptions({
      onSuccess: (data) => {
        // Redirect to Chargily checkout
        window.location.href = data.checkoutUrl;
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create checkout");
      },
    }),
  );

  const handleRegister = () => {
    if (isFreeEvent) {
      registerMutation.mutate({ eventId });
    } else {
      checkoutMutation.mutate({ eventId });
    }
  };

  const isLoading = registerMutation.isPending || checkoutMutation.isPending;

  // Already registered and paid
  if (isRegistered && isPaid) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl",
          "border-2 border-primary/30",
          "bg-gradient-to-br from-primary/5 via-chart-2/5 to-primary/5"
        )}
      >
        {/* Pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Success glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative p-8">
          <div className="flex flex-col items-center text-center">
            {/* Success icon */}
            <div
              className={cn(
                "mb-4 flex size-16 items-center justify-center rounded-2xl",
                "bg-gradient-to-br from-primary/20 to-chart-2/20",
                "ring-4 ring-primary/10"
              )}
            >
              <IconCheck className="size-8 text-primary" />
            </div>

            <h3 className="font-display text-2xl font-bold text-foreground">
              You&apos;re Registered!
            </h3>
            <p className="mt-2 max-w-md text-muted-foreground">
              You have successfully registered for{" "}
              <span className="font-medium text-foreground">{eventTitle}</span>.
              We look forward to seeing you there!
            </p>

            {/* Registration details */}
            <div
              className={cn(
                "mt-6 flex items-center gap-6 rounded-xl",
                "bg-card/50 border border-border/50 px-6 py-3"
              )}
            >
              <div className="flex items-center gap-2">
                <IconTicket className="size-5 text-primary" />
                <span className="text-sm font-medium">Registration Fee</span>
              </div>
              <Badge
                className={cn(
                  "border-primary/30 bg-primary/10 text-primary",
                  "text-sm font-medium"
                )}
              >
                {priceDisplay} &mdash; Paid
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registered but payment pending
  if (isRegistered && isPending) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl",
          "border-2 border-chart-4/30",
          "bg-gradient-to-br from-chart-4/5 via-card to-chart-4/5"
        )}
      >
        {/* Pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative p-8">
          <div className="flex flex-col items-center text-center">
            {/* Pending icon */}
            <div
              className={cn(
                "mb-4 flex size-16 items-center justify-center rounded-2xl",
                "bg-chart-4/10 ring-4 ring-chart-4/10"
              )}
            >
              <IconClock className="size-8 text-chart-4" />
            </div>

            <h3 className="font-display text-2xl font-bold text-chart-4">
              Payment Pending
            </h3>
            <p className="mt-2 max-w-md text-muted-foreground">
              Your registration is pending payment. Please complete the payment
              to confirm your spot.
            </p>

            {/* Price display */}
            <div
              className={cn(
                "mt-6 flex items-center gap-6 rounded-xl",
                "bg-card/50 border border-border/50 px-6 py-3"
              )}
            >
              <div className="flex items-center gap-2">
                <IconCurrencyDollar className="size-5 text-chart-4" />
                <span className="text-sm font-medium">Amount Due</span>
              </div>
              <Badge
                className={cn(
                  "border-chart-4/30 bg-chart-4/10 text-chart-4",
                  "text-sm font-medium"
                )}
              >
                {priceDisplay}
              </Badge>
            </div>

            <Button
              onClick={handleRegister}
              disabled={isLoading}
              size="lg"
              className={cn(
                "mt-6 gap-2",
                "bg-gradient-to-r from-chart-4 to-chart-4/80",
                "hover:from-chart-4/90 hover:to-chart-4/70"
              )}
            >
              {isLoading ? (
                <IconLoader2 className="size-5 animate-spin" />
              ) : (
                <IconArrowRight className="size-5" />
              )}
              {isLoading ? "Processing..." : `Complete Payment (${priceDisplay})`}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border/50",
          "bg-gradient-to-br from-card via-card to-card/80"
        )}
      >
        {/* Pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Decorative gradient */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-gradient-to-br from-primary/10 via-chart-2/5 to-transparent blur-3xl" />

        <div className="relative p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-chart-2/10">
                <IconTicket className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Registration
                </h3>
                <p className="text-sm text-muted-foreground">
                  Secure your spot at this event
                </p>
              </div>
            </div>
            <Badge
              className={cn(
                isFreeEvent
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-chart-2/30 bg-chart-2/10 text-chart-2",
                "text-base font-semibold px-4 py-1"
              )}
            >
              {priceDisplay}
            </Badge>
          </div>

          {/* Sign in prompt */}
          <div
            className={cn(
              "rounded-2xl border-2 border-dashed border-border/50",
              "bg-muted/30 p-6 text-center"
            )}
          >
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/10">
              <IconLogin className="size-7 text-primary" />
            </div>
            <h4 className="font-display font-semibold text-foreground">
              Sign in to register
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Please sign in to your account to register for this event.
            </p>
            <Button
              asChild
              size="lg"
              className={cn(
                "mt-4 w-full gap-2",
                "bg-gradient-to-r from-primary to-chart-2",
                "hover:from-primary/90 hover:to-chart-2/90"
              )}
            >
              <Link href="/login">
                <IconLogin className="size-5" />
                Sign In to Register
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated but not registered
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80"
      )}
    >
      {/* Pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative gradient */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-gradient-to-br from-primary/10 via-chart-2/5 to-transparent blur-3xl" />

      <div className="relative p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-chart-2/10">
              <IconTicket className="size-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">
                Registration
              </h3>
              <p className="text-sm text-muted-foreground">
                Secure your spot at this event
              </p>
            </div>
          </div>
          <Badge
            className={cn(
              isFreeEvent
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-chart-2/30 bg-chart-2/10 text-chart-2",
              "text-base font-semibold px-4 py-1"
            )}
          >
            {priceDisplay}
          </Badge>
        </div>

        {/* Features */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconCheck className="size-4 text-primary" />
            <span>Access to all sessions</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconCheck className="size-4 text-primary" />
            <span>Q&A participation</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconCheck className="size-4 text-primary" />
            <span>Live polls access</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconCheck className="size-4 text-primary" />
            <span>Certificate of attendance</span>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={handleRegister}
          disabled={isLoading}
          size="lg"
          className={cn(
            "w-full gap-2 text-base",
            "bg-gradient-to-r from-primary to-chart-2",
            "hover:from-primary/90 hover:to-chart-2/90",
            "transition-all duration-300"
          )}
        >
          {isLoading ? (
            <IconLoader2 className="size-5 animate-spin" />
          ) : isFreeEvent ? (
            <IconSparkles className="size-5" />
          ) : (
            <IconArrowRight className="size-5" />
          )}
          {isLoading
            ? "Processing..."
            : isFreeEvent
              ? "Register Now"
              : `Pay & Register (${priceDisplay})`}
        </Button>

        {/* Security note */}
        {!isFreeEvent && (
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <IconShieldCheck className="size-4" />
            Secure payment powered by Chargily
          </p>
        )}
      </div>
    </div>
  );
}
