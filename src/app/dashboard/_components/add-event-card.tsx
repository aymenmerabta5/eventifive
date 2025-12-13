"use client";

import { useForm } from "@tanstack/react-form";
import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
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
import { client } from "@/utils/orpc";
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

async function uploadToPresignedUrl(file: File, uploadUrl: string) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to upload file to storage");
  }
}

export function AddEventCard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<WizardStep>("details");
  const [eventId, setEventId] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [speakerEmail, setSpeakerEmail] = useState("");
  const [speakerAffiliation, setSpeakerAffiliation] = useState("");
  const [speakerBio, setSpeakerBio] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");

  const createDraftMutation = useMutation(
    orpc.events.createDraft.mutationOptions({
      onError: (error) => {
        toast.error(error.message || "Failed to create draft event");
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
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
    ...orpc.events.invites.listForEvent.queryOptions({
      input: { eventId: eventId ?? "" },
    }),
    enabled: !!eventId && step !== "details",
  });

  const inviteSpeakerMutation = useMutation(
    orpc.events.invites.inviteSpeaker.mutationOptions({
      onSuccess: async () => {
        toast.success("Speaker invited");
        await invitesQuery.refetch();
      },
      onError: (error) => toast.error(error.message || "Failed to invite speaker"),
    }),
  );

  const inviteCommitteeMutation = useMutation(
    orpc.events.invites.inviteCommittee.mutationOptions({
      onSuccess: async () => {
        toast.success("Committee member invited");
        await invitesQuery.refetch();
      },
      onError: (error) => toast.error(error.message || "Failed to invite committee member"),
    }),
  );

  const approveCommitteeMutation = useMutation(
    orpc.events.invites.approveCommittee.mutationOptions({
      onSuccess: async () => {
        toast.success("Approved");
        await invitesQuery.refetch();
      },
      onError: (error) => toast.error(error.message || "Failed to approve"),
    }),
  );

  const ensureDraftEventCreatedAndMediaUploaded = async () => {
    const value = form.state.values;
    const parsed = createDraftEventSchema.safeParse(value);
    if (!parsed.success) {
      toast.error("Please fill all required fields.");
      return null;
    }

    const created = await createDraftMutation.mutateAsync({
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      location: parsed.data.location,
      priceAmount: parsed.data.priceAmount,
      priceCurrency: parsed.data.priceCurrency,
    });

    if (!created.eventId) {
      toast.error("Draft event was not created.");
      return null;
    }

    // TEACHING:
    // - We *never* block event creation on image upload.
    // - Uploads are best-effort: if they fail, the user can retry later.
    const hasAnyImages = !!coverImage || !!bannerImage || galleryImages.length > 0;

    if (hasAnyImages) {
      toast.message("Creating event… uploading images (best-effort).");

      // Upload images via the existing oRPC file pipeline (request → PUT → confirm)
      const uploadOne = async (file: File) => {
        const req = await client.files.requestUpload({
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
          eventId: created.eventId,
        });
        await uploadToPresignedUrl(file, req.uploadUrl);
        await client.files.confirmUpload({ fileId: req.fileId });
      };

      const failures: string[] = [];

      const tryUpload = async (file: File | null) => {
        if (!file) return;
        try {
          await uploadOne(file);
        } catch (e) {
          failures.push(file.name);
          console.error("Image upload failed:", e);
        }
      };

      await tryUpload(coverImage);
      await tryUpload(bannerImage);

      for (const img of galleryImages) {
        // continue on errors per-file
        await tryUpload(img);
      }

      if (failures.length > 0) {
        toast.warning(
          `Event created, but ${failures.length} image(s) failed to upload. You can continue and upload later.`,
        );
      } else {
        toast.success("Event created and images uploaded.");
      }
    } else {
      toast.success("Event created.");
    }

    void queryClient.invalidateQueries({ queryKey: ["my-events"] });
    setEventId(created.eventId);
    return created.eventId;
  };

  const handleNext = async () => {
    if (step === "details") {
      // Create event at the boundary to Step 2 (as requested)
      const id = await ensureDraftEventCreatedAndMediaUploaded();
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
              Create a draft in step 2, then invite people and wait for reviewer approval.
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
                      Event Description *
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
              {/* Images */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="size-4" />
                    Cover Image (optional)
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
                  />
                  {coverImage ? (
                    <p className="text-muted-foreground text-xs">{coverImage.name}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="size-4" />
                    Banner Image (optional)
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBannerImage(e.target.files?.[0] ?? null)}
                  />
                  {bannerImage ? (
                    <p className="text-muted-foreground text-xs">{bannerImage.name}</p>
                  ) : null}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="size-4" />
                    Gallery Images (optional)
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      setGalleryImages(Array.from(e.target.files ?? []))
                    }
                  />
                  {galleryImages.length > 0 ? (
                    <p className="text-muted-foreground text-xs">
                      {galleryImages.length} image(s) selected
                    </p>
                  ) : null}
                </div>
              </div>

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
                        min={startDate || undefined}
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
                        const url = `${window.location.origin}/invites`;
                        void navigator.clipboard.writeText(url);
                        toast.success("Invite page link copied.");
                      }}
                    >
                      <Link2 className="mr-2 size-4" />
                      Copy invites page link
                    </Button>
                    <Button
                      onClick={() => setStep("review")}
                      disabled={!eventId}
                      title={!eventId ? "Create the draft event first" : undefined}
                    >
                      Go to pending approvals
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium">Invite speaker</div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Add an existing user (by email). They accept from the{" "}
                    <span className="font-mono">/invites</span> page.
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        placeholder="speaker@email.com"
                        type="email"
                        disabled={!eventId || inviteSpeakerMutation.isPending}
                        value={speakerEmail}
                        onChange={(e) => setSpeakerEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Affiliation (optional)</Label>
                      <Input
                        placeholder="University / Company"
                        disabled={!eventId || inviteSpeakerMutation.isPending}
                        value={speakerAffiliation}
                        onChange={(e) => setSpeakerAffiliation(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bio (optional)</Label>
                      <Textarea
                        placeholder="Short bio"
                        disabled={!eventId || inviteSpeakerMutation.isPending}
                        value={speakerBio}
                        onChange={(e) => setSpeakerBio(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full"
                      disabled={!eventId || inviteSpeakerMutation.isPending}
                      onClick={() => {
                        if (!eventId) return;
                        const email = speakerEmail.trim();
                        if (!email) {
                          toast.error("Speaker email is required");
                          return;
                        }
                        inviteSpeakerMutation.mutate({
                          eventId,
                          email,
                          affiliation: speakerAffiliation.trim() || undefined,
                          bio: speakerBio.trim() || undefined,
                        });
                      }}
                    >
                      Invite speaker
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium">Invite reviewer</div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Reviewers must already have accounts. They accept from{" "}
                    <span className="font-mono">/invites</span>, then you approve in step 3.
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        placeholder="reviewer@email.com"
                        type="email"
                        disabled={!eventId || inviteCommitteeMutation.isPending}
                        value={reviewerEmail}
                        onChange={(e) => setReviewerEmail(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full"
                      disabled={!eventId || inviteCommitteeMutation.isPending}
                      onClick={() => {
                        if (!eventId) return;
                        const email = reviewerEmail.trim();
                        if (!email) {
                          toast.error("Reviewer email is required");
                          return;
                        }
                        inviteCommitteeMutation.mutate({
                          eventId,
                          email,
                          type: "reviewer",
                        });
                      }}
                    >
                      Invite reviewer
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium">Current invites</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  Speakers show pending/accepted. Committee shows reviewer + workshop facilitator.
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
                        invitesQuery.data.speakers.map((s) => (
                          <div
                            key={`speaker-${s.id}`}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                          >
                            <div className="text-sm">
                              <span className="font-medium">{s.userEmail}</span>{" "}
                              <span className="text-muted-foreground">({s.status})</span>
                            </div>
                          </div>
                        ))
                      )}

                      <div className="mt-4 text-sm font-medium">Committee</div>
                      {invitesQuery.data.committee.length === 0 ? (
                        <div className="text-muted-foreground text-sm">
                          No committee invites yet.
                        </div>
                      ) : (
                        invitesQuery.data.committee.map((c) => (
                          <div
                            key={`committee-${c.id}`}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                          >
                            <div className="text-sm">
                              <span className="font-medium">{c.userEmail}</span>{" "}
                              <span className="text-muted-foreground">
                                ({c.type} / {c.status})
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
                <div className="text-sm font-medium">
                  Pending + accepted committee approvals
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  When reviewers/workshop facilitators accept on <span className="font-mono">/invites</span>,
                  they move to “accepted”. Here, you approve the accepted ones.
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium">Reviewer committee</div>
                <div className="mt-3 space-y-2">
                  {invitesQuery.isPending ? (
                    <div className="text-muted-foreground text-sm">Loading…</div>
                  ) : null}

                  {invitesQuery.data ? (
                    <>
                      {invitesQuery.data.committee
                        .filter((c) => c.type === "reviewer")
                        .map((c) => (
                          <div
                            key={`reviewer-${c.id}`}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                          >
                            <div className="text-sm">
                              <span className="font-medium">{c.userEmail}</span>{" "}
                              <span className="text-muted-foreground">({c.status})</span>
                            </div>
                            <Button
                              variant="outline"
                              disabled={c.status !== "accepted" || approveCommitteeMutation.isPending}
                              onClick={() => {
                                if (!eventId) return;
                                approveCommitteeMutation.mutate({
                                  eventId,
                                  committeeId: c.id,
                                });
                              }}
                            >
                              Approve accepted
                            </Button>
                          </div>
                        ))}
                      {invitesQuery.data.committee.filter((c) => c.type === "reviewer").length ===
                      0 ? (
                        <div className="text-muted-foreground text-sm">No reviewer invites.</div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium">Workshop-facilitator committee</div>
                <div className="mt-3 space-y-2">
                  {invitesQuery.data ? (
                    <>
                      {invitesQuery.data.committee
                        .filter((c) => c.type === "workshop_facilitator")
                        .map((c) => (
                          <div
                            key={`wf-${c.id}`}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                          >
                            <div className="text-sm">
                              <span className="font-medium">{c.userEmail}</span>{" "}
                              <span className="text-muted-foreground">({c.status})</span>
                            </div>
                            <Button
                              variant="outline"
                              disabled={c.status !== "accepted" || approveCommitteeMutation.isPending}
                              onClick={() => {
                                if (!eventId) return;
                                approveCommitteeMutation.mutate({
                                  eventId,
                                  committeeId: c.id,
                                });
                              }}
                            >
                              Approve accepted
                            </Button>
                          </div>
                        ))}
                      {invitesQuery.data.committee.filter(
                        (c) => c.type === "workshop_facilitator",
                      ).length === 0 ? (
                        <div className="text-muted-foreground text-sm">
                          No workshop-facilitator invites.
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === "details" || createDraftMutation.isPending}
            >
              Back
            </Button>

            {step !== "review" ? (
              <StatefulButton
                type="button"
                onClick={handleNext}
                className="h-11 cursor-pointer rounded-4xl"
                disabled={createDraftMutation.isPending}
              >
                {createDraftMutation.isPending ? "Working..." : "Next"}
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
