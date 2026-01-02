"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CalendarDays, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

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
  WizardProgress,
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
    inviteCommunicatorMutation,
    removeSpeakerMutation,
    removeReviewerMutation,
    removeCommunicatorMutation,
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

  // Chair options - includes accepted speakers, approved communicators, and workshop facilitators
  const { data: chairOptionsData } = useQuery({
    ...orpc.sessions.getChairOptions.queryOptions({
      input: { eventId: activeEventId ?? "" },
    }),
    enabled: !!activeEventId && (mode === "update" || step === "sessions"),
  });

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
        speakers: invitesQuery.data.speakers,
        reviewers: invitesQuery.data.reviewers,
        communicators: invitesQuery.data.communicators,
      }
    : undefined;

  // Chair options from API - includes accepted speakers, approved communicators, and workshop facilitators
  const chairOptions = useMemo((): ChairOption[] => {
    return chairOptionsData?.chairOptions ?? [];
  }, [chairOptionsData]);

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
    <div className="border-border/60 bg-card relative overflow-hidden rounded-3xl border shadow-lg">
      {/* Decorative background elements */}
      <div className="from-primary/10 pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-gradient-to-br to-transparent blur-3xl" />
      <div className="from-primary/5 pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full bg-gradient-to-tr to-transparent blur-3xl" />

      {/* Header */}
      <div className="border-border/40 from-muted/30 relative border-b bg-gradient-to-b to-transparent px-6 py-6 sm:px-8">
        <div className="flex items-start gap-4">
          <div className="bg-primary text-primary-foreground shadow-primary/25 flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-lg">
            {isCreateMode ? (
              <Sparkles className="size-6" />
            ) : (
              <CalendarDays className="size-6" />
            )}
          </div>
          <div>
            <h1 className="font-display text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              {isCreateMode ? "Create New Event" : "Update Event"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {isCreateMode
                ? "Follow the steps to create and configure your event."
                : "Modify event details, manage invites, and configure sessions."}
            </p>
          </div>
        </div>

        {/* Wizard Progress - only show for create mode */}
        {showWizard && (
          <div className="mt-8">
            <WizardProgress
              steps={WIZARD_STEPS.map((s) => ({
                key: s.key,
                label: s.label,
                description: s.description,
              }))}
              currentKey={step}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative p-6 sm:p-8">
        <div className="space-y-8">
          {/* Loading state for update mode */}
          {isUpdateMode && prefill.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-border/60 bg-muted/30 flex items-center gap-3 rounded-xl border px-4 py-3"
            >
              <Loader2 className="text-primary size-5 animate-spin" />
              <span className="text-muted-foreground text-sm">
                Loading event details...
              </span>
            </motion.div>
          )}

          {/* Error state for update mode */}
          {isUpdateMode && prefill.notFound && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm"
            >
              Unable to load this event. Please return to your events and try
              again.
            </motion.div>
          )}

          {isUpdateMode && prefill.missingEventId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-border text-muted-foreground rounded-xl border border-dashed px-4 py-3 text-sm"
            >
              Select an event from My Events to update it here.
            </motion.div>
          )}

          {/* Step Content with Animation */}
          <AnimatePresence mode="wait">
            {/* Step 1: Details (for create mode wizard or update mode) */}
            {(step === "details" || isUpdateMode) && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: isCreateMode ? 20 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
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
                  {isCreateMode && step === "details" && (
                    <EventImagesSection
                      disabled={!!createdEventId}
                      onFilesChange={setEventImages}
                    />
                  )}

                  {/* Images section for update mode */}
                  {isUpdateMode && !prefill.isPending && !prefill.notFound && (
                    <EventImagesSection
                      disabled={isUpdating}
                      onFilesChange={setEventImages}
                      existingImages={existingImagesForUploader}
                      isLoadingImages={existingImagesQuery.isPending}
                      onRemoveExistingImage={handleRemoveExistingImage}
                    />
                  )}
                </form>
              </motion.div>
            )}

            {/* Step 2: Invites (create mode only) */}
            {isCreateMode && step === "invites" && createdEventId && (
              <motion.div
                key="invites"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <InvitesStep
                  eventId={createdEventId}
                  eventType={form.state.values.type}
                  invitesData={invitesData}
                  isLoading={invitesQuery.isPending}
                  inviteSpeakerMutation={inviteSpeakerMutation}
                  inviteReviewerMutation={inviteReviewerMutation}
                  removeSpeakerMutation={removeSpeakerMutation}
                  removeReviewerMutation={removeReviewerMutation}
                />
              </motion.div>
            )}

            {/* Step 3: Sessions (create mode only) */}
            {isCreateMode && step === "sessions" && createdEventId && (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SessionsStep
                  eventId={createdEventId}
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
              </motion.div>
            )}

            {/* Step 4: Review (create mode only) */}
            {isCreateMode && step === "review" && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ReviewStep
                  invitesData={invitesData}
                  isLoading={invitesQuery.isPending}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Update mode: Show invites section below form */}
          {isUpdateMode &&
            activeEventId &&
            !prefill.isPending &&
            !prefill.notFound && (
              <div className="border-border/40 space-y-8 border-t pt-8">
                <div>
                  <h2 className="font-display text-foreground text-xl font-semibold">
                    Manage Invites
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Invite speakers and reviewers to your event
                  </p>
                </div>
                <InvitesStep
                  eventId={activeEventId}
                  eventType={form.state.values.type}
                  invitesData={invitesData}
                  isLoading={invitesQuery.isPending}
                  inviteSpeakerMutation={inviteSpeakerMutation}
                  inviteReviewerMutation={inviteReviewerMutation}
                  removeSpeakerMutation={removeSpeakerMutation}
                  removeReviewerMutation={removeReviewerMutation}
                />

                <div className="border-border/40 border-t pt-8">
                  <h2 className="font-display text-foreground text-xl font-semibold">
                    Program Schedule
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Manage rooms and session schedule
                  </p>
                </div>
                <SessionsStep
                  eventId={activeEventId}
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

                <div className="border-border/40 border-t pt-8">
                  <h2 className="font-display text-foreground text-xl font-semibold">
                    Event Readiness
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Check if your event is ready to publish
                  </p>
                </div>
                <ReviewStep
                  invitesData={invitesData}
                  isLoading={invitesQuery.isPending}
                />
              </div>
            )}

          {/* Navigation */}
          <div className="border-border/40 border-t pt-6">
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
        </div>
      </div>
    </div>
  );
}
