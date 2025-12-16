"use client";

/**
 * EventRegistration Component (Main Container)
 * 
 * ARCHITECTURAL PATTERN:
 * This is a "container" component that handles:
 * 1. Data fetching (queries for participants, submissions)
 * 2. State mutations (accept/reject workshop submissions)
 * 3. Tab navigation orchestration
 * 
 * The actual UI rendering is delegated to specialized "presentation" 
 * components (ParticipantsTab, CommitteeTab, WorkshopTab).
 * 
 * WHY THIS PATTERN?
 * - Separation of concerns: data logic vs. presentation logic
 * - Easier testing: presentation components can be tested with mock data
 * - Better maintainability: changes to one tab don't affect others
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Users,
  FileText,
  Presentation,
  ArrowLeft,
  RefreshCcw,
  Loader2,
} from "lucide-react";

import { ParticipantsTab } from "./participants-tab";
import { CommitteeTab } from "./committee-tab";
import { WorkshopTab } from "./workshop-tab";
import {
  isWorkshopSubmission,
  type CommitteeSubmission,
  type WorkshopSubmission,
} from "./event-registration-utils";

type EventRegistrationProps = {
  eventId: string;
};

export function EventRegistration({ eventId }: EventRegistrationProps) {
  const router = useRouter();

  /**
   * QUERY: Fetch all submissions for this event.
   * The oRPC query options pattern provides type-safe query keys
   * and automatic cache invalidation.
   */
  const registrationsQuery = useQuery({
    ...orpc.submissions.listForOrganizer.queryOptions({
      input: { eventId },
    }),
  });

  /**
   * QUERY: Fetch all participants for this event.
   * Participants are users who registered (possibly paid) for the event.
   */
  const participantsQuery = useQuery({
    ...orpc.events.listParticipants.queryOptions({
      input: { eventId },
    }),
  });

  /**
   * MUTATION: Update workshop submission status (accept/reject).
   * Uses optimistic updates via onSuccess refetch for immediate UI feedback.
   */
  const updateStatusMutation = useMutation(
    orpc.submissions.updateStatus.mutationOptions({
      onSuccess: () => {
        toast.success("Updated workshop status");
        registrationsQuery.refetch();
      },
      onError: (error) => {
        console.error("Failed to update status:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update status",
        );
      },
    }),
  );

  // Extract data with defaults for type safety
  const submissions = registrationsQuery.data?.submissions ?? [];
  const participants = participantsQuery.data?.participants ?? [];

  /**
   * FILTERING LOGIC:
   * Split submissions into workshop vs. committee based on keywords/title.
   * Workshop submissions have "workshop" in keywords or title starts with "Workshop Application".
   */
  const workshopSubmissions: WorkshopSubmission[] = submissions.filter((submission) =>
    isWorkshopSubmission(submission.keywords, submission.title),
  );
  const committeeSubmissions: CommitteeSubmission[] = submissions.filter(
    (submission) => !isWorkshopSubmission(submission.keywords, submission.title),
  );

  const isRefetching = registrationsQuery.isRefetching || participantsQuery.isRefetching;

  const handleRefresh = () => {
    void registrationsQuery.refetch();
    void participantsQuery.refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Event Registrations
            </h1>
            <p className="text-muted-foreground">
              Manage participants, committee submissions, and workshop applications.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefetching}>
              {isRefetching ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 size-4" />
              )}
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard?view=my-events")}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to my events
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="participants" className="w-full space-y-6">
        <TabsList className="h-12 w-full justify-start">
          <TabsTrigger value="participants" className="gap-2">
            <Users className="size-4" />
            <span className="text-md hidden sm:inline">Participants</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {participants.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="committee-members" className="gap-2">
            <FileText className="size-4" />
            <span className="text-md hidden sm:inline">Committee Members</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {committeeSubmissions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="workshop-facilitators" className="gap-2">
            <Presentation className="size-4" />
            <span className="text-md hidden sm:inline">Workshop Facilitators</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {workshopSubmissions.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Tab Content - Each tab is a separate component */}
        <TabsContent value="participants">
          <ParticipantsTab
            participants={participants}
            isLoading={participantsQuery.isPending}
          />
        </TabsContent>

        <TabsContent value="committee-members">
          <CommitteeTab
            submissions={committeeSubmissions}
            isLoading={registrationsQuery.isPending}
          />
        </TabsContent>

        <TabsContent value="workshop-facilitators">
          <WorkshopTab
            submissions={workshopSubmissions}
            isLoading={registrationsQuery.isPending}
            onAccept={(submissionId) =>
              updateStatusMutation.mutate({
                submissionId,
                status: "accepted",
              })
            }
            onReject={(submissionId) =>
              updateStatusMutation.mutate({
                submissionId,
                status: "rejected",
              })
            }
            isUpdating={updateStatusMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

