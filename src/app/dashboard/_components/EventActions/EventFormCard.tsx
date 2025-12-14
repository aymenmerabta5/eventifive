"use client";

import { useState, useMemo, useEffect, Activity } from "react";
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
} from "./hooks";
import {
  EventDetailsForm,
  EventImagesSection,
  InvitesStep,
  ReviewStep,
  FormNavigation,
} from "./components";

import { WIZARD_STEPS } from "./constants";
import { getNowMinDateTime } from "./utils";
import type { EventFormCardProps, WizardStep, InvitesData } from "./types";
import type { EventType } from "@/server/db/schema";

export function EventFormCard({ mode, eventId: propEventId }: EventFormCardProps) {
  // For create mode: track the created event ID
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [eventImages, setEventImages] = useState<File[]>([]);
  const [step, setStep] = useState<WizardStep>("details");

  // For update mode: prefill from existing event
  const prefill = useEventPrefill(mode === "update" ? propEventId : undefined);

  // Form state
  const form = useEventForm(mode, prefill.initialValues ?? undefined);

  // Reset form when initial values change (for update mode)
  useEffect(() => {
    if (prefill.initialValues) {
      form.reset(prefill.initialValues);
    }
  }, [prefill.initialValues]);

  // Mutations
  const { createDraft, isCreating } = useEventDraft();
  const updateMutation = useEventUpdate();

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
    !!activeEventId && (mode === "update" || step !== "details")
  );

  const nowMinDateTime = useMemo(() => getNowMinDateTime(), []);

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
            eventImages
          ));
        if (id) {
          setCreatedEventId(id);
          setEventImages([]); // Clear images after upload
          setStep("invites");
        }
      }
    } else if (step === "invites") {
      setStep("review");
    }
  };

  const handleBack = () => {
    if (step === "invites") setStep("details");
    if (step === "review") setStep("invites");
  };

  const handleSubmit = () => {
    if (mode === "update" && propEventId) {
      updateMutation.mutate({
        eventId: propEventId,
        title: form.state.values.title,
        description: form.state.values.description || undefined,
        type: form.state.values.type as EventType,
        startDate: form.state.values.startDate,
        endDate: form.state.values.endDate,
        location: form.state.values.location || undefined,
        priceAmount: form.state.values.priceAmount,
        priceCurrency: form.state.values.priceCurrency,
      });
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
                steps={WIZARD_STEPS as unknown as Array<{ key: string; label: string; description: string }>}
                currentKey={step}
              />
          </Activity>

          {/* Loading/Error states for update mode */}
          <Activity mode={isUpdateMode && prefill.notFound ? "visible" : "hidden"}>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading event details...
              </div>
          </Activity>

          <Activity mode={isUpdateMode && prefill.notFound ? "visible" : "hidden"}>
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Unable to load this event. Please return to your events and try again.
            </div>
          </Activity>

          <Activity mode={isUpdateMode && prefill.missingEventId ? "visible" : "hidden"}>
            <div className="rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
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
                  handleSubmit();
                }
              }}
              className="space-y-6"
            >
              <EventDetailsForm
                form={form}
                nowMinDateTime={nowMinDateTime}
                disabled={isCreating || (isUpdateMode && prefill.isPending)}
                showBigDescription={isCreateMode}
              />

              <Activity mode={isCreateMode && step === "details" ? "visible" : "hidden"}>
                <EventImagesSection
                  disabled={!!createdEventId}
                  onFilesChange={setEventImages}
                />
              </Activity>
            </form>
          )}

          {/* Update mode: Show invites section below form */}
          <Activity mode={isUpdateMode && activeEventId && !prefill.isPending && !prefill.notFound ? "visible" : "hidden"}>
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-semibold">Manage Invites</h3>
              <InvitesStep
                eventId={activeEventId ?? ""}
                eventType={form.state.values.type}
                invitesData={invitesData}
                isLoading={invitesQuery.isPending}
                inviteSpeakerMutation={inviteSpeakerMutation}
                inviteReviewerMutation={inviteReviewerMutation}
                inviteCommitteeMutation={inviteCommitteeMutation}
                removeSpeakerMutation={removeSpeakerMutation}
                removeReviewerMutation={removeReviewerMutation}
                removeCommitteeMutation={removeCommitteeMutation}
              />

              <h3 className="text-lg font-semibold">Event Readiness</h3>
              <ReviewStep
                invitesData={invitesData}
                isLoading={invitesQuery.isPending}
              />
            </div>
          </Activity>

          {/* Step 2: Invites (create mode only) */}
          <Activity mode={isCreateMode && step === "invites" && createdEventId && createdEventId !== null ? "visible" : "hidden"}>
            <InvitesStep
              eventId={createdEventId ?? ""}
              eventType={form.state.values.type}
              invitesData={invitesData}
              isLoading={invitesQuery.isPending}
              inviteSpeakerMutation={inviteSpeakerMutation}
              inviteReviewerMutation={inviteReviewerMutation}
              inviteCommitteeMutation={inviteCommitteeMutation}
              removeSpeakerMutation={removeSpeakerMutation}
              removeReviewerMutation={removeReviewerMutation}
              removeCommitteeMutation={removeCommitteeMutation}
            />
          </Activity>

          {/* Step 3: Review (create mode only) */}
          <Activity mode={isCreateMode && step === "review" ? "visible" : "hidden"}>
            <ReviewStep
              invitesData={invitesData}
              isLoading={invitesQuery.isPending}
            />
          </Activity>

          {/* Navigation */}
          <FormNavigation
            mode={mode}
            step={step}
            isLoading={isCreating || updateMutation.isPending}
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
