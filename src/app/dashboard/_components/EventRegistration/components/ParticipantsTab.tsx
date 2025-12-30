"use client";

import { cn } from "@/lib/utils";
import { IconUsers, IconLoader2 } from "@tabler/icons-react";
import { ParticipantStatsCards } from "./ParticipantStatsCards";
import { ParticipantCard } from "./ParticipantCard";
import type { Participant } from "../types";

interface ParticipantsTabProps {
  participants: Participant[];
  isLoading: boolean;
}

export function ParticipantsTab({
  participants,
  isLoading,
}: ParticipantsTabProps) {
  const stats = {
    total: participants.length,
    paid: participants.filter((p) => p.paymentStatus === "paid").length,
    pending: participants.filter((p) => p.paymentStatus === "pending").length,
  };

  return (
    <div className="space-y-6">
      <ParticipantStatsCards
        total={stats.total}
        paid={stats.paid}
        pending={stats.pending}
      />

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/50",
          "bg-gradient-to-br from-card via-card to-card/80"
        )}
      >
        {/* Pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Accent strip */}
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-chart-2" />

        <div className="relative p-6">
          <div className="mb-6 space-y-1">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Registered Participants
            </h3>
            <p className="text-sm text-muted-foreground">
              All users who have registered for this event.
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <IconLoader2 className="size-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading participants...
              </span>
            </div>
          )}

          {!isLoading && participants.length === 0 && (
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 p-12",
                "bg-gradient-to-br from-muted/30 to-muted/10"
              )}
            >
              <div
                className={cn(
                  "mb-4 flex size-16 items-center justify-center rounded-2xl",
                  "bg-gradient-to-br from-primary/10 to-chart-2/10"
                )}
              >
                <IconUsers className="size-8 text-primary/60" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                No participants yet
              </h3>
              <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                Participants will appear here once they register for your event.
              </p>
            </div>
          )}

          {participants.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {participants.map((participant) => (
                <ParticipantCard
                  key={participant.id}
                  participant={participant}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
