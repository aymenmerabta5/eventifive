"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials } from "../utils";
import { PAYMENT_STATUS_STYLES } from "../constants";
import type { Participant, PaymentStatus } from "../types";

interface ParticipantCardProps {
  participant: Participant;
}

export function ParticipantCard({ participant }: ParticipantCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80",
        "transition-all duration-300",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      )}
    >
      {/* Pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.01] dark:opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "16px 16px",
        }}
      />

      <div className="relative flex items-start gap-3 p-4">
        <Avatar className="size-10 ring-2 ring-primary/10">
          <AvatarFallback
            className={cn(
              "bg-gradient-to-br from-primary/10 to-chart-2/10",
              "font-medium text-primary text-xs"
            )}
          >
            {getInitials(participant.userName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="truncate font-medium text-sm text-foreground">
            {participant.userName ?? "Unknown user"}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {participant.userEmail}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] capitalize font-medium",
                PAYMENT_STATUS_STYLES[participant.paymentStatus as PaymentStatus]
              )}
            >
              {participant.paymentStatus}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              Registered{" "}
              {new Date(participant.registeredAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
