"use client";

import { useState, useMemo, useEffect, useCallback, Activity } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StepProgress } from "@/components/step-progress";
import { Loader2 } from "lucide-react";

import {
  useEventForm,
  useEventDraft,
  useEventUpdate,
  useEventInvites,
  useEventPrefill,
  useEventImages,
  useEventRooms,
  useEventSessions,
} from "./hooks";
import {
  EventDetailsForm,
  EventImagesSection,
  InvitesStep,
  SessionsStep,
  ReviewStep,
  FormNavigation,
} from "./components";
import type { ChairOption } from "@/components/calendar";

import { WIZARD_STEPS } from "./constants";
import { getNowMinDateTime } from "./utils";
import type { EventFormCardProps, WizardStep, InvitesData } from "./types";
import type { EventType } from "@/server/db/schema";
import type { ExistingImage } from "@/components/uploader";

export function EventFormCard({
  mode,
  eventId: propEventId,
}: EventFormCardProps) {
  // For create mode: track the created event ID
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [eventImages, setEventImages] = useState<File[]>([]);
  const [step, setStep] = useState<WizardStep>("details");

  // For update mode: track images to remove
  const [removeImageIds, setRemoveImageIds] = useState<string[]>([]);

  // For update mode: prefill from existing event
  const prefill = useEventPrefill(mode === "update" ? propEventId : undefined);

  // For update mode: fetch existing images
  const existingImagesQuery = useEventImages(
    mode === "update" ? propEventId : undefined,
  );

  // Form state
  const form = useEventForm(mode, prefill.initialValues ?? undefined);

  // Reset form when initial values change (for update mode)
  useEffect(() => {
    if (prefill.initialValues) {
      form.reset(prefill.initialValues);
    }
  }, [prefill.initialValues]);

  // Reset remove list when images are refetched
  useEffect(() => {
    setRemoveImageIds([]);
  }, [existingImagesQuery.images]);

  // Mutations
  const { createDraft, isCreating } = useEventDraft();
  const { updateEvent, isUpdating } = useEventUpdate();

  // Determine the active event ID for invites
  const activeEventId = mode === "update" ? propEventId : createdEventId;

  // Invites (for both create and update modes)
  const {
    invitesQuery,
    inviteSpeakerMutation,
    inviteReviewerMutation,
    inviteCommitteeMutation,
    removeSpeakerMutation,
    removeReviewerMutation,
    removeCommitteeMutation,
  } = useEventInvites(
    activeEventId ?? null,
    !!activeEventId && (mode === "update" || step !== "details"),
  );

  // Rooms (for sessions step)
  const {
    rooms,
    isLoading: isLoadingRooms,
    createRoom,
    deleteRoom,
    isCreating: isCreatingRoom,
    isDeleting: isDeletingRoom,
  } = useEventRooms(
    activeEventId ?? null,
    !!activeEventId && (mode === "update" || step === "sessions"),
  );

  // Sessions (for sessions step)
  const {
    sessions,
    isLoading: isLoadingSessions,
    createSession,
    updateSession,
    deleteSession,
  } = useEventSessions(
    activeEventId ?? null,
    !!activeEventId && (mode === "update" || step === "sessions"),
  );

  const nowMinDateTime = useMemo(() => getNowMinDateTime(), []);

  // Transform existing images to ExistingImage format
  const existingImagesForUploader = useMemo((): ExistingImage[] => {
    return existingImagesQuery.images
      .filter((img) => !removeImageIds.includes(img.fileId))
      .map((img) => ({
        fileId: img.fileId,
        url: img.url,
        fileName: img.fileName,
        fileSize: img.fileSize,
        isDefault: img.isDefault,
      }));
  }, [existingImagesQuery.images, removeImageIds]);

  const handleRemoveExistingImage = useCallback((fileId: string) => {
    setRemoveImageIds((prev) => [...prev, fileId]);
  }, []);

  const handleNext = async () => {
    if (step === "details") {
      if (mode === "create") {
        // Create draft and move to invites
        const id =
          createdEventId ??
          (await createDraft(
            {
              title: form.state.values.title,
              description: form.state.values.description,
              bigDescription: form.state.values.bigDescription,
              type: form.state.values.type,
              startDate: form.state.values.startDate,
              endDate: form.state.values.endDate,
              location: form.state.values.location,
              priceAmount: form.state.values.priceAmount,
              priceCurrency: form.state.values.priceCurrency,
            },
            eventImages,
          ));
        if (id) {
          setCreatedEventId(id);
          setEventImages([]); // Clear images after upload
          setStep("invites");
        }
      }
    } else if (step === "invites") {
      setStep("sessions");
    } else if (step === "sessions") {
      setStep("review");
    }
  };

  const handleBack = () => {
    if (step === "invites") setStep("details");
    if (step === "sessions") setStep("invites");
    if (step === "review") setStep("sessions");
  };

  const handleSubmit = async () => {
    if (mode === "update" && propEventId) {
      await updateEvent(
        {
          eventId: propEventId,
          title: form.state.values.title,
          description: form.state.values.description || undefined,
          bigDescription: form.state.values.bigDescription,
          type: form.state.values.type as EventType,
          startDate: form.state.values.startDate,
          endDate: form.state.values.endDate,
          location: form.state.values.location || undefined,
          priceAmount: form.state.values.priceAmount,
          priceCurrency: form.state.values.priceCurrency,
        },
        eventImages,
        removeImageIds,
      );
    }
  };

  // Determine what to render
  const isCreateMode = mode === "create";
  const isUpdateMode = mode === "update";
  const showWizard = isCreateMode;

  // Transform invites data to match expected types
  const invitesData: InvitesData | undefined = invitesQuery.data
    ? {
        speaker: invitesQuery.data.speaker,
        reviewers: invitesQuery.data.reviewers,
        committee: invitesQuery.data.committee,
      }
    : undefined;

  // Build chair options from accepted speakers and committee members
  const chairOptions = useMemo((): ChairOption[] => {
    const options: ChairOption[] = [];

    // Add accepted speaker
    if (invitesData?.speaker?.status === "accepted") {
      options.push({
        id: invitesData.speaker.userId,
        name: invitesData.speaker.userName || invitesData.speaker.userEmail,
        email: invitesData.speaker.userEmail,
        image: null,
      });
    }

    // Add committee members
    invitesData?.committee.forEach((member) => {
      options.push({
        id: member.userId,
        name: member.userName || member.userEmail,
        email: member.userEmail,
        image: null,
      });
    });

    return options;
  }, [invitesData]);

  // Parse event dates for SessionsStep
  const eventStartDate = useMemo(() => {
    return form.state.values.startDate
      ? new Date(form.state.values.startDate)
      : new Date();
  }, [form.state.values.startDate]);

  const eventEndDate = useMemo(() => {
    return form.state.values.endDate
      ? new Date(form.state.values.endDate)
      : new Date();
  }, [form.state.values.endDate]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold md:text-3xl">
          {isCreateMode ? "Create New Event" : "Update Event"}
        </CardTitle>
        <CardDescription>
          {isCreateMode
            ? "Create a draft first, upload images, then invite people."
            : "Update the details below to modify the event."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Activity mode={showWizard ? "visible" : "hidden"}>
            <StepProgress
              steps={
                WIZARD_STEPS as unknown as Array<{
                  key: string;
                  label: string;
                  description: string;
                }>
              }
              currentKey={step}
            />
          </Activity>

          {/* Loading state for update mode */}
          <Activity
            mode={isUpdateMode && prefill.isPending ? "visible" : "hidden"}
          >
            <div className="border-border/60 bg-muted/60 text-muted-foreground flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Loading event details...
            </div>
          </Activity>

          {/* Error state for update mode */}
          <Activity
            mode={isUpdateMode && prefill.notFound ? "visible" : "hidden"}
          >
            <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
              Unable to load this event. Please return to your events and try
              again.
            </div>
          </Activity>

          <Activity
            mode={isUpdateMode && prefill.missingEventId ? "visible" : "hidden"}
          >
            <div className="border-border text-muted-foreground rounded-lg border border-dashed px-3 py-2 text-sm">
              Select an event from My Events to update it here.
            </div>
          </Activity>

          {/* Step 1: Details (for create mode wizard or update mode) */}
          {(step === "details" || isUpdateMode) && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isUpdateMode) {
                  void handleSubmit();
                }
              }}
              className="space-y-6"
            >
              <EventDetailsForm
                form={form}
                nowMinDateTime={nowMinDateTime}
                disabled={
                  isCreating ||
                  isUpdating ||
                  (isUpdateMode && prefill.isPending)
                }
              />

              {/* Images section for create mode */}
              <Activity
                mode={isCreateMode && step === "details" ? "visible" : "hidden"}
              >
                <EventImagesSection
                  disabled={!!createdEventId}
                  onFilesChange={setEventImages}
                />
              </Activity>

              {/* Images section for update mode */}
              <Activity
                mode={
                  isUpdateMode && !prefill.isPending && !prefill.notFound
                    ? "visible"
                    : "hidden"
                }
              >
                <EventImagesSection
                  disabled={isUpdating}
                  onFilesChange={setEventImages}
                  existingImages={existingImagesForUploader}
                  isLoadingImages={existingImagesQuery.isPending}
                  onRemoveExistingImage={handleRemoveExistingImage}
                />
              </Activity>
            </form>
          )}

          {/* Update mode: Show invites section below form */}
          <Activity
            mode={
              isUpdateMode &&
              activeEventId &&
              !prefill.isPending &&
              !prefill.notFound
                ? "visible"
                : "hidden"
            }
          >
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-semibold">Manage Invites</h3>
              <InvitesStep
                eventId={activeEventId ?? ""}
                eventType={form.state.values.type}
                invitesData={invitesData}
                isLoading={invitesQuery.isPending}
                inviteSpeakerMutation={inviteSpeakerMutation}
                inviteReviewerMutation={inviteReviewerMutation}
                removeSpeakerMutation={removeSpeakerMutation}
                removeReviewerMutation={removeReviewerMutation}
              />

              <h3 className="text-lg font-semibold">Program Schedule</h3>
              <SessionsStep
                eventId={activeEventId ?? ""}
                eventStartDate={eventStartDate}
                eventEndDate={eventEndDate}
                rooms={rooms}
                isLoadingRooms={isLoadingRooms}
                onCreateRoom={createRoom}
                onDeleteRoom={deleteRoom}
                isCreatingRoom={isCreatingRoom}
                isDeletingRoom={isDeletingRoom}
                sessions={sessions}
                isLoadingSessions={isLoadingSessions}
                onCreateSession={createSession}
                onUpdateSession={updateSession}
                onDeleteSession={deleteSession}
                chairOptions={chairOptions}
              />

              <h3 className="text-lg font-semibold">Event Readiness</h3>
              <ReviewStep
                invitesData={invitesData}
                isLoading={invitesQuery.isPending}
              />
            </div>
          </Activity>

          {/* Step 2: Invites (create mode only) */}
          <Activity
            mode={
              isCreateMode &&
              step === "invites" &&
              createdEventId &&
              createdEventId !== null
                ? "visible"
                : "hidden"
            }
          >
            <InvitesStep
              eventId={createdEventId ?? ""}
              eventType={form.state.values.type}
              invitesData={invitesData}
              isLoading={invitesQuery.isPending}
              inviteSpeakerMutation={inviteSpeakerMutation}
              inviteReviewerMutation={inviteReviewerMutation}
              removeSpeakerMutation={removeSpeakerMutation}
              removeReviewerMutation={removeReviewerMutation}
            />
          </Activity>

          {/* Step 3: Sessions (create mode only) */}
          <Activity
            mode={
              isCreateMode && step === "sessions" && createdEventId
                ? "visible"
                : "hidden"
            }
          >
            <SessionsStep
              eventId={createdEventId ?? ""}
              eventStartDate={eventStartDate}
              eventEndDate={eventEndDate}
              rooms={rooms}
              isLoadingRooms={isLoadingRooms}
              onCreateRoom={createRoom}
              onDeleteRoom={deleteRoom}
              isCreatingRoom={isCreatingRoom}
              isDeletingRoom={isDeletingRoom}
              sessions={sessions}
              isLoadingSessions={isLoadingSessions}
              onCreateSession={createSession}
              onUpdateSession={updateSession}
              onDeleteSession={deleteSession}
              chairOptions={chairOptions}
            />
          </Activity>

          {/* Step 4: Review (create mode only) */}
          <Activity
            mode={isCreateMode && step === "review" ? "visible" : "hidden"}
          >
            <ReviewStep
              invitesData={invitesData}
              isLoading={invitesQuery.isPending}
            />
          </Activity>

          {/* Navigation */}
          <FormNavigation
            mode={mode}
            step={step}
            isLoading={isCreating || isUpdating}
            canGoBack={step !== "details"}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />
        </div>
      </CardContent>
    </Card>
  );
}
