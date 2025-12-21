"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { orpc } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  IconCurrencyDollar,
  IconCheck,
  IconClock,
  IconLogin,
} from "@tabler/icons-react";
import Link from "next/link";

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
      <Card className="mt-6 border-green-500/50 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-green-600">
            <IconCheck className="size-5" />
            You&apos;re Registered!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            You have successfully registered for{" "}
            <span className="font-medium text-foreground">{eventTitle}</span>.
            We look forward to seeing you there!
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconCurrencyDollar className="text-green-600 size-5" />
              <span className="text-sm font-medium">Registration Fee</span>
            </div>
            <Badge variant="secondary" className="bg-green-500/10 text-green-600">
              {priceDisplay} - Paid
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Registered but payment pending
  if (isRegistered && isPending) {
    return (
      <Card className="mt-6 border-yellow-500/50 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-yellow-600">
            <IconClock className="size-5" />
            Payment Pending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Your registration is pending payment. Please complete the payment to
            confirm your spot.
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconCurrencyDollar className="text-yellow-600 size-5" />
              <span className="text-sm font-medium">Registration Fee</span>
            </div>
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
              {priceDisplay} - Pending
            </Badge>
          </div>
          <Button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Processing..." : `Complete Payment (${priceDisplay})`}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Registration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconCurrencyDollar className="text-primary size-5" />
              <span className="text-sm font-medium">Registration Fee</span>
            </div>
            <Badge
              variant={isFreeEvent ? "secondary" : "default"}
              className="text-sm"
            >
              {priceDisplay}
            </Badge>
          </div>

          <div className="rounded-lg border border-dashed p-4 text-center">
            <IconLogin className="mx-auto size-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm mb-3">
              Please sign in to register for this event.
            </p>
            <Button asChild className="w-full" size="lg">
              <Link href="/login">Sign In to Register</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Authenticated but not registered
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Registration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconCurrencyDollar className="text-primary size-5" />
            <span className="text-sm font-medium">Registration Fee</span>
          </div>
          <Badge
            variant={isFreeEvent ? "secondary" : "default"}
            className="text-sm"
          >
            {priceDisplay}
          </Badge>
        </div>

        <Button
          onClick={handleRegister}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading
            ? "Processing..."
            : isFreeEvent
              ? "Register Now"
              : `Pay & Register (${priceDisplay})`}
        </Button>

        {!isFreeEvent && (
          <p className="text-muted-foreground text-center text-xs">
            You will be redirected to complete payment securely.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
