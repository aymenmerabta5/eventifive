"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Type, FileText, Image as ImageIcon } from "lucide-react";
import { createDraftEventSchema } from "@/lib/schemas/schemas";
import { eventTypeValues, type EventType } from "@/server/db/schema";

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

export function AddEventCard() {
  const router = useRouter();
  const queryClient = useQueryClient();

 
  const [eventImage, setEventImage] = useState<File | null>(null);


  const createDraftMutation = useMutation(
    orpc.events.createDraft.mutationOptions({
      onError: (error) => {
        toast.error(error.message || "Failed to create event");
      },
    }),
  );

  // TEACHING: TanStack Form provides a type-safe form state management solution.
// Unlike React Hook Form, it uses a field-based API with render props,
  // giving you fine-grained control over each field's rendering and validation
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      type: "" as "" | EventType,
      startDate: "",
      endDate: "",
      location: "",
      image: "",
    },
    validators: {
      // TEACHING: onSubmit validator runs when the form is submitted.
      // We use Zod's safeParse to validate and return field-level errors
      // that TanStack Form can display next to each field.
      onSubmit: ({ value }) => {
        const result = createDraftEventSchema.safeParse(value);
        if (!result.success) {
          return result.error.formErrors.fieldErrors;
        }
      },
    },
  });

  // TEACHING: This function handles the complete event creation flow:
  // 1. Validate form data with Zod
  // 2. Create the event record in the database
  // 3. Upload images (best-effort - failures don't block event creation)
  // 4. Invalidate cache and redirect
  const handleSubmit = async () => {
    const value = form.state.values;
    const parsed = createDraftEventSchema.safeParse(value);
    
    if (!parsed.success) {
      toast.error("Please fill all required fields.");
      return;
    }

    // Create the event first
    const created = await createDraftMutation.mutateAsync({
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      location: parsed.data.location,
    });

    if (!created.eventId) {
      toast.error("Event was not created.");
      return;
    }

    // TEACHING: Image upload is "best-effort" - we don't want a failed upload
    // to prevent the user from creating their event. They can always add the image later.
    if (eventImage) {
      toast.message("Event created! Uploading image...");

      try {
        // TEACHING: FormData is the standard way to send files via HTTP
        // We include both the file and the eventId so the server knows
        // which event this image belongs to
        const formData = new FormData();
        formData.append("file", eventImage);
        formData.append("eventId", created.eventId);

        // TEACHING: Simple fetch to our API route - no presigned URLs needed!
        // The server handles validation, S3 upload, and database record creation
        const uploadRes = await fetch("/api/upload-event-image", {
          method: "POST",
          body: formData,
          // TEACHING: Don't set Content-Type header manually!
          // FormData sets it automatically with the correct boundary
        });

        if (!uploadRes.ok) {
          const error = await uploadRes.json();
          throw new Error(error.message || "Failed to upload image");
        }

        toast.success("Image uploaded successfully!");
      } catch (e) {
        console.error("Image upload failed:", e);
        toast.warning("Image failed to upload. You can add it later.");
      }
    } else {
      toast.success("Event created successfully!");
    }

    // TEACHING: Invalidate the cache so the events list refetches fresh data.
    // This ensures the user sees their new event when they navigate to the list.
    void queryClient.invalidateQueries({ queryKey: ["my-events"] });
    
    // Redirect to dashboard after successful creation
    router.push("/dashboard?view=my-events");
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold md:text-3xl">
          Create New Event
        </CardTitle>
        <CardDescription>
          Fill in the details below to create your event.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void handleSubmit();
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

          {/* Description Field */}
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

          {/* Image Field */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <ImageIcon className="size-4" />
              Event Image *
            </Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setEventImage(e.target.files?.[0] ?? null)}
            />
            {eventImage && (
              <p className="text-muted-foreground text-xs">{eventImage.name}</p>
            )}
          </div>

          {/* Date Fields */}
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
                  Location (optional)
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

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <StatefulButton
              type="submit"
              className="h-11 cursor-pointer rounded-4xl px-8"
              disabled={createDraftMutation.isPending}
            >
              {createDraftMutation.isPending ? "Creating..." : "Create Event"}
            </StatefulButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
