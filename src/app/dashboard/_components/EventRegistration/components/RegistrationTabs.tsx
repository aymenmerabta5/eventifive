"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  IconUsers,
  IconFileText,
  IconPresentation,
  IconAward,
} from "@tabler/icons-react";
import { ParticipantsTab } from "./ParticipantsTab";
import { CommunicatorTab } from "./CommunicatorTab";
import { WorkshopTab } from "./WorkshopTab";
import { CertificatesTab } from "./CertificatesTab";
import type {
  Participant,
  CommunicatorSubmission,
  WorkshopProposal,
} from "../types";

interface RegistrationTabsProps {
  eventId: string;
  eventStartDate?: Date;
  eventEndDate?: Date;
  participants: Participant[];
  communicatorSubmissions: CommunicatorSubmission[];
  workshopProposals: WorkshopProposal[];
  isParticipantsLoading: boolean;
  isSubmissionsLoading: boolean;
  isWorkshopProposalsLoading: boolean;
  onAcceptProposal: (
    workshopId: string,
    startAt?: string,
    endAt?: string,
  ) => void;
  onRejectProposal: (workshopId: string, reason: string) => void;
  isAcceptingProposal: boolean;
  isRejectingProposal: boolean;
}

export function RegistrationTabs({
  eventId,
  eventStartDate,
  eventEndDate,
  participants,
  communicatorSubmissions,
  workshopProposals,
  isParticipantsLoading,
  isSubmissionsLoading,
  isWorkshopProposalsLoading,
  onAcceptProposal,
  onRejectProposal,
  isAcceptingProposal,
  isRejectingProposal,
}: RegistrationTabsProps) {
  return (
    <Tabs defaultValue="participants" className="w-full space-y-6">
      <div
        className={cn(
          "border-border/50 relative overflow-hidden rounded-2xl border",
          "from-card via-card to-card/80 bg-gradient-to-br",
        )}
      >
        {/* Pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.01] dark:opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />

        <TabsList className="relative h-14 w-full justify-start gap-1 bg-transparent p-2">
          <TabsTrigger
            value="participants"
            className={cn(
              "gap-2 rounded-xl px-4 py-2.5",
              "data-[state=active]:bg-primary/10 data-[state=active]:text-primary",
              "data-[state=active]:shadow-sm",
            )}
          >
            <IconUsers className="size-4" />
            <span className="hidden sm:inline">Participants</span>
            <Badge
              variant="secondary"
              className="border-border/50 bg-muted/50 ml-1 text-xs"
            >
              {participants.length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="communicators"
            className={cn(
              "gap-2 rounded-xl px-4 py-2.5",
              "data-[state=active]:bg-chart-2/10 data-[state=active]:text-chart-2",
              "data-[state=active]:shadow-sm",
            )}
          >
            <IconFileText className="size-4" />
            <span className="hidden sm:inline">Communicators</span>
            <Badge
              variant="secondary"
              className="border-border/50 bg-muted/50 ml-1 text-xs"
            >
              {communicatorSubmissions.length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="workshop-facilitators"
            className={cn(
              "gap-2 rounded-xl px-4 py-2.5",
              "data-[state=active]:bg-chart-3/10 data-[state=active]:text-chart-3",
              "data-[state=active]:shadow-sm",
            )}
          >
            <IconPresentation className="size-4" />
            <span className="hidden sm:inline">Workshops</span>
            <Badge
              variant="secondary"
              className="border-border/50 bg-muted/50 ml-1 text-xs"
            >
              {workshopProposals.length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="certificates"
            className={cn(
              "gap-2 rounded-xl px-4 py-2.5",
              "data-[state=active]:bg-chart-4/10 data-[state=active]:text-chart-4",
              "data-[state=active]:shadow-sm",
            )}
          >
            <IconAward className="size-4" />
            <span className="hidden sm:inline">Certificates</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="participants" className="mt-0">
        <ParticipantsTab
          participants={participants}
          isLoading={isParticipantsLoading}
        />
      </TabsContent>

      <TabsContent value="communicators" className="mt-0">
        <CommunicatorTab
          submissions={communicatorSubmissions}
          isLoading={isSubmissionsLoading}
        />
      </TabsContent>

      <TabsContent value="workshop-facilitators" className="mt-0">
        <WorkshopTab
          proposals={workshopProposals}
          isLoading={isWorkshopProposalsLoading}
          onAccept={onAcceptProposal}
          onReject={onRejectProposal}
          isAccepting={isAcceptingProposal}
          isRejecting={isRejectingProposal}
          eventStartDate={eventStartDate}
          eventEndDate={eventEndDate}
        />
      </TabsContent>

      <TabsContent value="certificates" className="mt-0">
        <CertificatesTab eventId={eventId} />
      </TabsContent>
    </Tabs>
  );
}
