"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Loader2, Calendar, MapPin, ExternalLink } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import Link from "next/link";

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatEventType = (type: string): string => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getPaymentBadgeVariant = (status: string) => {
  switch (status) {
    case "paid":
      return "default";
    case "pending":
      return "secondary";
    case "unpaid":
      return "destructive";
    case "refunded":
      return "outline";
    default:
      return "secondary";
  }
};

const getPaymentLabel = (status: string): string => {
  switch (status) {
    case "paid":
      return "Paid";
    case "pending":
      return "Payment Pending";
    case "unpaid":
      return "Unpaid";
    case "refunded":
      return "Refunded";
    default:
      return status;
  }
};

const getEventStatus = (startDate: Date, endDate: Date) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "ended";
};

const getEventStatusBadge = (startDate: Date, endDate: Date) => {
  const status = getEventStatus(startDate, endDate);
  switch (status) {
    case "upcoming":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Upcoming
        </Badge>
      );
    case "live":
      return (
        <Badge variant="default" className="bg-green-500">
          Live
        </Badge>
      );
    case "ended":
      return (
        <Badge variant="secondary" className="text-muted-foreground">
          Ended
        </Badge>
      );
  }
};

export default function RegistrationsPage() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const { data, isLoading } = useQuery({
    ...orpc.events.myRegistrations.queryOptions({}),
    enabled: !!session,
  });

  if (isSessionPending) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const registrations = data?.registrations ?? [];

  return (
    <div className="container mx-auto min-h-screen py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-foreground text-2xl font-bold">
            My Registrations
          </h1>
          <p className="text-muted-foreground">
            View all events you have registered for
          </p>
        </div>

        {registrations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                No Registrations Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                You haven&apos;t registered for any events yet. Browse events to
                find something interesting!
              </p>
              <Button asChild>
                <Link href="/events">Browse Events</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {registrations.map((reg) => (
              <Card key={reg.id} className="flex flex-col overflow-hidden">
                {reg.event.imageUrl && (
                  <div className="relative h-40 w-full">
                    <img
                      src={reg.event.imageUrl}
                      alt={reg.event.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      {getEventStatusBadge(
                        reg.event.startDate,
                        reg.event.endDate,
                      )}
                    </div>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={getPaymentBadgeVariant(reg.paymentStatus)}>
                      {getPaymentLabel(reg.paymentStatus)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {formatEventType(reg.event.type)}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2 line-clamp-2 text-lg">
                    {reg.event.title}
                  </CardTitle>
                  {reg.event.smallDescription && (
                    <CardDescription className="line-clamp-2">
                      {reg.event.smallDescription}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between">
                  <div className="space-y-2 text-sm">
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(reg.event.startDate)} -{" "}
                        {formatDate(reg.event.endDate)}
                      </span>
                    </div>
                    {reg.event.location && (
                      <div className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{reg.event.location}</span>
                      </div>
                    )}
                    <div className="text-muted-foreground text-xs">
                      <span className="font-medium">Registered:</span>{" "}
                      {formatDate(reg.registeredAt)}
                    </div>
                    {reg.roleAtEvent !== "participant" && (
                      <div className="text-muted-foreground text-xs">
                        <span className="font-medium">Role:</span>{" "}
                        {reg.roleAtEvent}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <Button size="sm" className="w-full" asChild>
                      <Link href={`/events/${reg.eventId}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Event
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
