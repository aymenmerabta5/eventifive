"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { orpc } from "@/utils/orpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { IconCurrencyDollar } from "@tabler/icons-react";

interface EventRegistrationSectionProps {
  eventId: string;
  priceAmount: number;
  priceCurrency: string;
  eventTitle: string;
}

export function EventRegistrationSection({
  eventId,
  priceAmount,
  priceCurrency,
  eventTitle,
}: EventRegistrationSectionProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  const isFreeEvent = priceAmount <= 0;
  const priceDisplay = isFreeEvent
    ? "Free"
    : `${priceAmount.toLocaleString()} ${priceCurrency}`;

  // Free event registration mutation
  const registerMutation = useMutation(
    orpc.events.register.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to register for event");
      },
    })
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
    })
  );

  const handleRegister = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to register for this event");
      router.push("/login");
      return;
    }

    if (isFreeEvent) {
      registerMutation.mutate({ eventId });
    } else {
      checkoutMutation.mutate({ eventId });
    }
  };

  const isLoading = registerMutation.isPending || checkoutMutation.isPending;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Registration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconCurrencyDollar className="size-5 text-primary" />
            <span className="text-sm font-medium">Registration Fee</span>
          </div>
          <Badge variant={isFreeEvent ? "secondary" : "default"} className="text-sm">
            {priceDisplay}
          </Badge>
        </div>

        {!isAuthenticated && (
          <p className="text-sm text-muted-foreground">
            Please sign in to register for this event.
          </p>
        )}

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
          <p className="text-xs text-center text-muted-foreground">
            You will be redirected to complete payment securely.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
