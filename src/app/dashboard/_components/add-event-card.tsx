"use client";

import { useForm } from "@tanstack/react-form";
import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import { Uploader } from "@/components/uploader";
import Editor from "@/components/rich-text-editor/Editor";
import type { JSONContent } from "@tiptap/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Type, FileText, Image as ImageIcon, Link2, DollarSign } from "lucide-react";
import { createDraftEventSchema } from "@/lib/schemas/schemas";
import { eventTypeValues, type EventType } from "@/server/db/schema";
import { StepProgress } from "@/components/step-progress";
import { useQuery } from "@tanstack/react-query";

const eventTypeLabels: Record<EventType, string> = {
  congress: "Congress",
  seminar: "Seminar",
  workshop: "Workshop",
  scientific_meeting: "Scientific Meeting",
  conference: "Conference",
  symposium: "Symposium",
};

const eventTypeOptions = eventTypeValues.map((value) => ({
  value,
  label: eventTypeLabels[value],
}));

type WizardStep = "details" | "invites" | "review";

function toDateTimeLocalInputValue(date: Date): string {
  const pad2 = (n: number) => n.toString().padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const min = pad2(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

interface CreateEventResponse {
  status: "success" | "error";
  message: string;
  eventId?: string;
  errors?: Record<string, string[]>;
}

async function createDraftEvent(
  eventData: {
    title: string;
    description: string;
    bigDescription?: JSONContent;
    type: string;
    startDate: string;
    endDate: string;
    location: string;
    priceAmount: number;
    priceCurrency: string;
  },
  images: File[],
): Promise<CreateEventResponse> {
  const formData = new FormData();

  formData.append("title", eventData.title);
  formData.append("description", eventData.description);
  if (eventData.bigDescription !== undefined) {
    formData.append("bigDescription", JSON.stringify(eventData.bigDescription));
  }
  formData.append("type", eventData.type);
  formData.append("startDate", eventData.startDate);
  formData.append("endDate", eventData.endDate);
  formData.append("location", eventData.location);
  formData.append("priceAmount", eventData.priceAmount.toString());
  formData.append("priceCurrency", eventData.priceCurrency);
  for (const file of images) {
    formData.append("images", file);
  }

  const res = await fetch("/api/create-event", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create event");
  }

  return data as CreateEventResponse;
}

export function AddEventCard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<WizardStep>("details");
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventImages, setEventImages] = useState<File[]>([]);
  const [speakerEmails, setSpeakerEmails] = useState<string[]>(() => Array.from({ length: 3 }, () => ""));
  const [speakerAffiliations, setSpeakerAffiliations] = useState<string[]>(() =>
    Array.from({ length: 3 }, () => ""),
  );
  const [reviewerEmails, setReviewerEmails] = useState<string[]>(() => Array.from({ length: 5 }, () => ""));

  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const nowMinDateTime = useMemo(() => toDateTimeLocalInputValue(new Date()), []);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      bigDescription: undefined as JSONContent | undefined,
      type: "" as "" | EventType,
      startDate: "",
      endDate: "",
      location: "",
      priceAmount: 0,
      priceCurrency: "DZD",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = createDraftEventSchema.safeParse(value);
        if (!result.success) {
          return result.error.formErrors.fieldErrors;
        }
      },
    },
  });

  const steps = useMemo(
    () => [
      {
        key: "details",
        label: "Event details",
        description: "Info + images",
      },
      {
        key: "invites",
        label: "Invite people",
        description: "Invite speakers + reviewers",
      },
      {
        key: "review",
        label: "Approvals",
        description: "Pending / accepted / approve",
      },
    ],
    [],
  );

  const invitesQuery = useQuery({
    ...orpc.events.listInvites.queryOptions({
      input: { eventId: eventId ?? "" },
    }),
    enabled: !!eventId && step !== "details",
  });

  const inviteSpeakerMutation = useMutation(
    orpc.events.inviteSpeaker.mutationOptions({
      onSuccess: async () => {
        toast.success("Speaker invited");
        await invitesQuery.refetch();
      },
      onError: (error: Error) => toast.error(error.message || "Failed to invite speaker"),
    }),
  );

  const inviteReviewerMutation = useMutation(
    orpc.events.inviteReviewer.mutationOptions({
      onSuccess: async () => {
        toast.success("Reviewer invited");
        await invitesQuery.refetch();
      },
      onError: (error: Error) => toast.error(error.message || "Failed to invite reviewer"),
    }),
  );

  const setReviewerEmailAt = (index: number, value: string) => {
    setReviewerEmails((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const setSpeakerEmailAt = (index: number, value: string) => {
    setSpeakerEmails((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const setSpeakerAffiliationAt = (index: number, value: string) => {
    setSpeakerAffiliations((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const ensureDraftEventCreated = async () => {
    const value = form.state.values;

    // TEACHING: Validate locally first before making API call
    // This provides immediate feedback without network round-trip
    const parsed = createDraftEventSchema.safeParse(value);
    if (!parsed.success) {
      toast.error("Please fill all required fields.");
      return null;
    }

    setIsCreatingEvent(true);

    try {

      const result = await createDraftEvent(
        {
          title: parsed.data.title,
          description: parsed.data.description,
          bigDescription: parsed.data.bigDescription as JSONContent | undefined,
          type: parsed.data.type,
          startDate: parsed.data.startDate,
          endDate: parsed.data.endDate,
          location: parsed.data.location ?? "",
          priceAmount: parsed.data.priceAmount ?? 0,
          priceCurrency: parsed.data.priceCurrency ?? "DZD",
        },
        eventImages,
      );

      if (!result.eventId) {
        toast.error("Draft event was not created.");
        return null;
      }

      toast.success("Draft event created.");


      void queryClient.invalidateQueries({ queryKey: ["my-events"] });
      setEventId(result.eventId);
      setEventImages([]);
      return result.eventId;
    } catch (error) {

      const message = error instanceof Error ? error.message : "Failed to create event";
      toast.error(message);
      return null;
    } finally {

      setIsCreatingEvent(false);
    }
  };

  const handleNext = async () => {
    if (step === "details") {
      const id = eventId ?? (await ensureDraftEventCreated());
      if (id) setStep("invites");
      return;
    }

    if (step === "invites") {
      setStep("review");
      return;
    }
  };

  const handleBack = () => {
    if (step === "invites") setStep("details");
    if (step === "review") setStep("invites");
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold md:text-3xl">
              Create New Event
            </CardTitle>
            <CardDescription>
              Create a draft first, upload gallery images, then invite people and wait for reviewer approval.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <StepProgress steps={steps} currentKey={step} />

          {step === "details" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="space-y-6"
            >
              {/* Title Field */}
              <form.Field name="title">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor={field.name}
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <FileText className="size-4" />
                      Event Title *
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter event title"
                      className="w-full"
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={error} className="text-destructive text-sm">
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>

              {/* Type Field */}
              <form.Field name="type">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor={field.name}
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <Type className="size-4" />
                      Event Type *
                    </Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value as typeof field.state.value)
                      }
                      onOpenChange={(open) => !open && field.handleBlur()}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors.map((error) => (
                      <p key={error} className="text-destructive text-sm">
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>

              {/* Small Description */}
              <form.Field name="description">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor={field.name}
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <FileText className="size-4" />
                      Event Small Description *
                    </Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Short summary shown in cards and lists"
                      className="min-h-[90px] w-full"
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={error} className="text-destructive text-sm">
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>

              {/* Big Description */}
              <form.Field name="bigDescription">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="size-4" />
                      Event Big Description *
                    </Label>
                    <Editor
                      className="w-full bg-transparent"
                      toolbarClassName="px-4 py-2"
                      contentClassName="min-h-[90px] px-4 py-2"
                      content={field.state.value as JSONContent | undefined}
                      value={field.state.value as JSONContent | string | undefined}
                      onChange={(value) => field.handleChange(value)}
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={error} className="text-destructive text-sm">
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
              

              {/* Images */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="size-4" />
                    Event Images (cover + gallery)
                  </Label>
                  <Uploader
                    role="event_image"
                    kind="gallery"
                    mode="select"
                    disabled={!!eventId}
                    onFilesChange={(files) => setEventImages(files)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Start Date Field */}
                <form.Field name="startDate">
                  {(field) => (
                    <div className="space-y-2">
                      <Label
                        htmlFor={field.name}
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <Calendar className="size-4" />
                        Start Date *
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="datetime-local"
                        value={field.state.value}
                        min={nowMinDateTime}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full"
                      />
                      {field.state.meta.errors.map((error) => (
                        <p key={error} className="text-destructive text-sm">
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </form.Field>

                {/* End Date Field */}
                <form.Field name="endDate">
                  {(field) => {
                    const startDate = form.getFieldValue("startDate");
                    return (
                      <div className="space-y-2">
                        <Label
                          htmlFor={field.name}
                          className="flex items-center gap-2 text-sm font-medium"
                        >
                          <Calendar className="size-4" />
                          End Date *
                        </Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="datetime-local"
                          value={field.state.value}
                          min={nowMinDateTime || undefined}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="w-full"
                        />
                        {field.state.meta.errors.map((error) => (
                          <p key={error} className="text-destructive text-sm">
                            {error}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                </form.Field>
              </div>

              {/* Location Field */}
              <form.Field name="location">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor={field.name}
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <MapPin className="size-4" />
                      Location
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter event location"
                      className="w-full"
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={error} className="text-destructive text-sm">
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>

              {/* Price Field */}
              <form.Field name="priceAmount">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor={field.name}
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <DollarSign className="size-4" />
                      Registration Price (DZD)
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min="0"
                      step="100"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                      placeholder="0 for free event"
                      className="w-full"
                    />
                    <p className="text-muted-foreground text-xs">
                      Enter 0 for a free event (e.g., 5000 = 5000 DZD)
                    </p>
                    {field.state.meta.errors.map((error) => (
                      <p key={error} className="text-destructive text-sm">
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </form>
          ) : null}

          {step === "invites" ? (
            <div className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium">Draft event created</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  Event ID: <span className="font-mono">{eventId}</span>
                </div>
                {eventId ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const eventType = form.state.values.type;
                        if (!eventType) {
                          toast.error("Event type is missing. Please go back and select an event type.");
                          return;
                        }

                        const url = new URL(`/events/${eventType}/${eventId}`, window.location.origin).toString();
                        void navigator.clipboard.writeText(url);
                        toast.success("Event page link copied.");
                      }}
                    >
                      <Link2 className="mr-2 size-4" />
                      Copy event page link
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium">Invite speaker</div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Invite 1 primary speaker. Backup slots unlock only after a speaker rejects. Speakers accept/reject from{" "}
                    <span className="font-mono">/invites</span>.
                  </div>

                  <div className="mt-4 space-y-4">
                    {[0, 1, 2].map((idx) => {
                      const slot = idx + 1;
                      const isBackup = slot >= 2;
                      const hasRejection = (invitesQuery.data?.speakers ?? []).some((s) => s.status === "rejected");
                      const backupUnlocked = !isBackup || hasRejection;

                      return (
                        <div key={`speaker-slot-${slot}`} className="rounded-md border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium">
                              {slot === 1 ? "Primary speaker" : `Backup speaker ${slot - 1}`}
                            </div>
                            <div className="text-muted-foreground text-xs">Slot {slot}/3</div>
                          </div>

                          <div className="mt-3 space-y-2">
                            <Label>Email</Label>
                            <Input
                              placeholder="speaker@email.com"
                              type="email"
                              disabled={!eventId || inviteSpeakerMutation.isPending || !backupUnlocked}
                              value={speakerEmails[idx] ?? ""}
                              onChange={(e) => setSpeakerEmailAt(idx, e.target.value)}
                            />
                            {!backupUnlocked ? (
                              <div className="text-muted-foreground text-xs">
                                Backup slots unlock after the primary speaker rejects.
                              </div>
                            ) : null}
                          </div>

                          <div className="mt-3 space-y-2">
                            <Label>Affiliation (optional)</Label>
                            <Input
                              placeholder="University / Company"
                              disabled={!eventId || inviteSpeakerMutation.isPending || !backupUnlocked}
                              value={speakerAffiliations[idx] ?? ""}
                              onChange={(e) => setSpeakerAffiliationAt(idx, e.target.value)}
                            />
                          </div>

                          <div className="mt-3">
                            <Button
                              className="w-full"
                              disabled={!eventId || inviteSpeakerMutation.isPending || !backupUnlocked}
                              onClick={() => {
                                if (!eventId) return;
                                const email = (speakerEmails[idx] ?? "").trim();
                                if (!email) {
                                  toast.error("Speaker email is required");
                                  return;
                                }
                                inviteSpeakerMutation.mutate({
                                  eventId,
                                  email,
                                  slot,
                                  affiliation: (speakerAffiliations[idx] ?? "").trim() || undefined,
                                });
                              }}
                            >
                              {slot === 1 ? "Invite primary speaker" : "Invite backup speaker"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium">Invite reviewers</div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Invite 3 primary reviewers. Two backup slots unlock only after a reviewer rejects.
                  </div>

                  <div className="mt-4 space-y-4">
                    {[0, 1, 2, 3, 4].map((idx) => {
                      const slot = idx + 1;
                      const isBackup = slot >= 4;
                      const hasRejection = (invitesQuery.data?.reviewers ?? []).some(
                        (r) => r.status === "rejected",
                      );
                      const backupUnlocked = !isBackup || hasRejection;

                      return (
                        <div key={`reviewer-slot-${slot}`} className="rounded-md border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium">
                              {isBackup ? `Backup reviewer ${slot - 3}` : `Reviewer ${slot}`}
                            </div>
                            <div className="text-muted-foreground text-xs">Slot {slot}/5</div>
                          </div>

                          <div className="mt-3 space-y-2">
                            <Label>Email</Label>
                            <Input
                              placeholder="reviewer@email.com"
                              type="email"
                              disabled={!eventId || inviteReviewerMutation.isPending || !backupUnlocked}
                              value={reviewerEmails[idx] ?? ""}
                              onChange={(e) => setReviewerEmailAt(idx, e.target.value)}
                            />
                            {!backupUnlocked ? (
                              <div className="text-muted-foreground text-xs">
                                Backup slots unlock after at least one reviewer rejects.
                              </div>
                            ) : null}
                          </div>

                          <div className="mt-3">
                            <Button
                              className="w-full"
                              disabled={!eventId || inviteReviewerMutation.isPending || !backupUnlocked}
                              onClick={() => {
                                if (!eventId) return;
                                const email = (reviewerEmails[idx] ?? "").trim();
                                if (!email) {
                                  toast.error("Reviewer email is required");
                                  return;
                                }
                                inviteReviewerMutation.mutate({
                                  eventId,
                                  email,
                                  slot,
                                });
                              }}
                            >
                              {isBackup ? "Invite backup reviewer" : "Invite reviewer"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium">Current invites</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  Speakers show pending/accepted. Reviewers show pending/accepted/rejected.
                </div>

                <div className="mt-4 space-y-3">
                  {invitesQuery.isPending ? (
                    <div className="text-muted-foreground text-sm">Loading…</div>
                  ) : null}

                  {invitesQuery.data ? (
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Speakers</div>
                      {invitesQuery.data.speakers.length === 0 ? (
                        <div className="text-muted-foreground text-sm">No speakers invited yet.</div>
                      ) : (
                        invitesQuery.data.speakers
                          .slice()
                          .sort((a, b) => a.slot - b.slot)
                          .map((s) => (
                          <div
                            key={`speaker-${s.id}`}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                          >
                            <div className="text-sm">
                              <span className="text-muted-foreground mr-2 text-xs">
                                {s.slot === 1 ? "Primary" : `Backup ${s.slot - 1}`}
                              </span>
                              <span className="font-medium">{s.userEmail}</span>{" "}
                              <span className="text-muted-foreground">({s.status})</span>
                            </div>
                          </div>
                        ))
                      )}

                      <div className="mt-4 text-sm font-medium">Reviewers</div>
                      {invitesQuery.data.reviewers.length === 0 ? (
                        <div className="text-muted-foreground text-sm">No reviewers invited yet.</div>
                      ) : (
                        invitesQuery.data.reviewers
                          .slice()
                          .sort((a, b) => a.slot - b.slot)
                          .map((r) => (
                            <div
                              key={`reviewer-${r.id}`}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                            >
                              <div className="text-sm">
                                <span className="font-medium">{r.userEmail}</span>{" "}
                                <span className="text-muted-foreground">
                                  (slot {r.slot} • {r.status})
                                </span>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {step === "review" ? (
            <div className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium">Review your event setup</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  Review the speakers and reviewers you&apos;ve invited for this event.
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium">Reviewers</div>
                <div className="mt-3 space-y-2">
                  {invitesQuery.isPending ? (
                    <div className="text-muted-foreground text-sm">Loading…</div>
                  ) : null}

                  {invitesQuery.data && invitesQuery.data.reviewers.length === 0 ? (
                    <div className="text-muted-foreground text-sm">No reviewers invited.</div>
                  ) : null}

                  {invitesQuery.data?.reviewers
                    .slice()
                    .sort((a, b) => a.slot - b.slot)
                    .map((r) => (
                    <div
                      key={`reviewer-${r.id}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                    >
                      <div className="text-sm">
                        <span className="font-medium">{r.userName || r.userEmail}</span>
                        {r.userName ? (
                          <span className="text-muted-foreground ml-1">({r.userEmail})</span>
                        ) : null}
                        <span className="text-muted-foreground ml-2">• slot {r.slot}</span>
                      </div>
                      <div className="text-xs">
                        <span
                          className={
                            r.status === "accepted"
                              ? "text-green-600"
                              : r.status === "rejected"
                                ? "text-red-600"
                                : "text-muted-foreground"
                          }
                        >
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium">Speakers</div>
                <div className="mt-3 space-y-2">
                  {invitesQuery.data && invitesQuery.data.speakers.length === 0 ? (
                    <div className="text-muted-foreground text-sm">No speakers invited.</div>
                  ) : null}

                  {invitesQuery.data?.speakers
                    .slice()
                    .sort((a, b) => a.slot - b.slot)
                    .map((s) => (
                    <div
                      key={`speaker-${s.id}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                    >
                      <div className="text-sm">
                        <span className="text-muted-foreground mr-2 text-xs">
                          {s.slot === 1 ? "Primary" : `Backup ${s.slot - 1}`}
                        </span>
                        <span className="font-medium">{s.userName || s.userEmail}</span>
                        {s.userName ? (
                          <span className="text-muted-foreground ml-1">({s.userEmail})</span>
                        ) : null}
                        {s.affiliation ? (
                          <span className="text-muted-foreground ml-2">• {s.affiliation}</span>
                        ) : null}
                      </div>
                      <div className="text-xs">
                        <span
                          className={
                            s.status === "accepted"
                              ? "text-green-600"
                              : s.status === "rejected"
                                ? "text-red-600"
                              : "text-muted-foreground"
                          }
                        >
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === "details" || isCreatingEvent}
            >
              Back
            </Button>

            {step !== "review" ? (
              <StatefulButton
                type="button"
                onClick={handleNext}
                className="h-11 cursor-pointer rounded-4xl"
                disabled={isCreatingEvent}
              >
                {isCreatingEvent ? "Working..." : "Next"}
              </StatefulButton>
            ) : (
              <Button
                onClick={() => {
                  router.push("/dashboard?view=my-events");
                }}
              >
                Done
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
