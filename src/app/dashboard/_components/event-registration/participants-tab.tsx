"use client";

/**
 * ParticipantsTab Component
 * 
 * WHAT THIS COMPONENT DOES:
 * Displays registered participants for an event with their payment status.
 * Shows statistics cards and a grid of participant cards.
 * 
 * PATTERN USED:
 * This is a "presentation" component that receives data via props.
 * Data fetching is handled by the parent component (event-registration.tsx).
 * This separation makes the component easier to test and reuse.
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Users, CheckCircle2, Clock } from "lucide-react";
import {
  type Participant,
  type PaymentStatus,
  paymentStatusStyles,
  getInitials,
} from "./event-registration-utils";

type ParticipantsTabProps = {
  participants: Participant[];
  isLoading: boolean;
};

export function ParticipantsTab({ participants, isLoading }: ParticipantsTabProps) {
  // Compute statistics for the stats cards
  const stats = {
    total: participants.length,
    paid: participants.filter((p) => p.paymentStatus === "paid").length,
    unpaid: participants.filter((p) => p.paymentStatus === "unpaid").length,
    pending: participants.filter((p) => p.paymentStatus === "pending").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-muted-foreground text-xs">All registered participants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle2 className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            <p className="text-muted-foreground text-xs">Payment confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-muted-foreground text-xs">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Participants List Section */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold">Registered Participants</CardTitle>
          <CardDescription>
            All users who have registered for this event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground text-sm">Loading…</div>
          ) : null}

          {!isLoading && participants.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No participants yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Participants will appear here once they register for your event.
              </p>
            </div>
          ) : null}

          {participants.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(participant.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="truncate text-sm font-medium">
                      {participant.userName ?? "Unknown user"}
                    </div>
                    <div className="text-muted-foreground truncate text-xs">
                      {participant.userEmail}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] capitalize",
                          paymentStatusStyles[participant.paymentStatus as PaymentStatus],
                        )}
                      >
                        {participant.paymentStatus}
                      </Badge>
                      <span className="text-muted-foreground text-[10px]">
                        Registered {new Date(participant.registeredAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

