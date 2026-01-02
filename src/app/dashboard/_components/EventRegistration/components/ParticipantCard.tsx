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
        "group border-border/50 relative overflow-hidden rounded-xl border",
        "from-card via-card to-card/80 bg-gradient-to-br",
        "transition-all duration-300",
        "hover:border-primary/30 hover:shadow-primary/5 hover:shadow-lg",
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
        <Avatar className="ring-primary/10 size-10 ring-2">
          <AvatarFallback
            className={cn(
              "from-primary/10 to-chart-2/10 bg-gradient-to-br",
              "text-primary text-xs font-medium",
            )}
          >
            {getInitials(participant.userName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="text-foreground truncate text-sm font-medium">
            {participant.userName ?? "Unknown user"}
          </div>
          <div className="text-muted-foreground truncate text-xs">
            {participant.userEmail}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-medium capitalize",
                PAYMENT_STATUS_STYLES[
                  participant.paymentStatus as PaymentStatus
                ],
              )}
            >
              {participant.paymentStatus}
            </Badge>
            <span className="text-muted-foreground text-[10px]">
              Registered{" "}
              {new Date(participant.registeredAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
