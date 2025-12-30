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
import { CommitteeTab } from "./CommitteeTab";
import { WorkshopTab } from "./WorkshopTab";
import { CertificatesTab } from "./CertificatesTab";
import type {
  Participant,
  CommitteeSubmission,
  WorkshopSubmission,
} from "../types";

interface RegistrationTabsProps {
  eventId: string;
  participants: Participant[];
  committeeSubmissions: CommitteeSubmission[];
  workshopSubmissions: WorkshopSubmission[];
  isParticipantsLoading: boolean;
  isSubmissionsLoading: boolean;
  onAcceptWorkshop: (submissionId: string) => void;
  onRejectWorkshop: (submissionId: string) => void;
  isUpdating: boolean;
}

export function RegistrationTabs({
  eventId,
  participants,
  committeeSubmissions,
  workshopSubmissions,
  isParticipantsLoading,
  isSubmissionsLoading,
  onAcceptWorkshop,
  onRejectWorkshop,
  isUpdating,
}: RegistrationTabsProps) {
  return (
    <Tabs defaultValue="participants" className="w-full space-y-6">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/50",
          "bg-gradient-to-br from-card via-card to-card/80"
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
              "data-[state=active]:shadow-sm"
            )}
          >
            <IconUsers className="size-4" />
            <span className="hidden sm:inline">Participants</span>
            <Badge
              variant="secondary"
              className="ml-1 border-border/50 bg-muted/50 text-xs"
            >
              {participants.length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="committee-members"
            className={cn(
              "gap-2 rounded-xl px-4 py-2.5",
              "data-[state=active]:bg-chart-2/10 data-[state=active]:text-chart-2",
              "data-[state=active]:shadow-sm"
            )}
          >
            <IconFileText className="size-4" />
            <span className="hidden sm:inline">Committee</span>
            <Badge
              variant="secondary"
              className="ml-1 border-border/50 bg-muted/50 text-xs"
            >
              {committeeSubmissions.length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="workshop-facilitators"
            className={cn(
              "gap-2 rounded-xl px-4 py-2.5",
              "data-[state=active]:bg-chart-3/10 data-[state=active]:text-chart-3",
              "data-[state=active]:shadow-sm"
            )}
          >
            <IconPresentation className="size-4" />
            <span className="hidden sm:inline">Workshops</span>
            <Badge
              variant="secondary"
              className="ml-1 border-border/50 bg-muted/50 text-xs"
            >
              {workshopSubmissions.length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="certificates"
            className={cn(
              "gap-2 rounded-xl px-4 py-2.5",
              "data-[state=active]:bg-chart-4/10 data-[state=active]:text-chart-4",
              "data-[state=active]:shadow-sm"
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

      <TabsContent value="committee-members" className="mt-0">
        <CommitteeTab
          submissions={committeeSubmissions}
          isLoading={isSubmissionsLoading}
        />
      </TabsContent>

      <TabsContent value="workshop-facilitators" className="mt-0">
        <WorkshopTab
          submissions={workshopSubmissions}
          isLoading={isSubmissionsLoading}
          onAccept={onAcceptWorkshop}
          onReject={onRejectWorkshop}
          isUpdating={isUpdating}
        />
      </TabsContent>

      <TabsContent value="certificates" className="mt-0">
        <CertificatesTab eventId={eventId} />
      </TabsContent>
    </Tabs>
  );
}
