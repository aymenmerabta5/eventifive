"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Editor from "@/components/rich-text-editor/Editor";
import {
  Calendar,
  MapPin,
  Sparkles,
  FileText,
  Coins,
  Info,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAIGeneration } from "../hooks/useAIGeneration";
import type { EventType } from "@/server/db/schema/enums";
import { FormSection, FormGroup, FormFieldWrapper } from "./FormSection";
import { eventTypeOptions } from "../constants";
import { addDaysToDateTimeLocalInputValue } from "../utils";
import type { EventFormInstance } from "../hooks/useEventForm";
import type { JSONContent } from "@tiptap/react";

interface EventDetailsFormProps {
  form: EventFormInstance;
  nowMinDateTime: string;
  disabled?: boolean;
  showBigDescription?: boolean;
}

export function EventDetailsForm({
  form,
  nowMinDateTime,
  disabled = false,
  showBigDescription = true,
}: EventDetailsFormProps) {
  const { generateAsync, isGenerating } = useAIGeneration();

  const handleGenerateWithAI = async () => {
    const title = form.state.values.title;
    const eventType = form.state.values.type;

    if (!title) {
      toast.error("Please enter a title first");
      return;
    }

    try {
      const result = await generateAsync({
        title,
        eventType: eventType as EventType,
      });

      // Update form fields with generated content
      form.setFieldValue("description", result.smallDescription);
      if (showBigDescription) {
        form.setFieldValue("bigDescription", result.bigDescription);
      }
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <FormSection
        icon={<Sparkles className="size-5" />}
        title="Basic Information"
        description="Essential details about your event"
        variant="highlight"
      >
        <FormGroup>
          {/* Title Field */}
          <form.Field name="title">
            {(field) => (
              <FormFieldWrapper>
                <Label
                  htmlFor={field.name}
                  className="text-foreground flex items-center gap-2 text-sm font-medium"
                >
                  Event Title
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., International AI Conference 2025"
                  className="placeholder:text-muted-foreground/50 h-10 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
                  disabled={disabled}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error} className="text-destructive text-sm">
                    {error}
                  </p>
                ))}
              </FormFieldWrapper>
            )}
          </form.Field>

          {/* Type Field */}
          <form.Field name="type">
            {(field) => (
              <FormFieldWrapper>
                <Label
                  htmlFor={field.name}
                  className="text-foreground flex items-center gap-2 text-sm font-medium"
                >
                  Event Type
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as typeof field.state.value)
                  }
                  onOpenChange={(open) => !open && field.handleBlur()}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-10 border-0 bg-transparent shadow-none focus:ring-0">
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
              </FormFieldWrapper>
            )}
          </form.Field>
        </FormGroup>
      </FormSection>

      {/* Description Section */}
      <FormSection
        icon={<FileText className="size-5" />}
        title="Event Description"
        description="Help attendees understand what your event is about"
        action={
          <form.Subscribe selector={(state) => state.values.title}>
            {(title) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || isGenerating || !title}
                onClick={handleGenerateWithAI}
                className="gap-1.5 text-xs"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3" />
                    Generate with AI
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        }
      >
        <div className="space-y-5">
          {/* Small Description */}
          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className="text-foreground flex items-center gap-2 text-sm font-medium"
                >
                  Short Summary
                  <span className="text-destructive">*</span>
                  <span className="text-muted-foreground ml-auto text-xs font-normal">
                    Shown in cards and listings
                  </span>
                </Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="A brief, compelling description of your event..."
                  className="border-border/60 bg-muted/30 focus:bg-muted/50 min-h-[100px] resize-none rounded-xl text-base transition-colors"
                  disabled={disabled}
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
          {showBigDescription && (
            <form.Field name="bigDescription">
              {(field) => (
                <div className="space-y-2">
                  <Label
                    htmlFor={field.name}
                    className="text-foreground flex items-center gap-2 text-sm font-medium"
                  >
                    Full Description
                    <span className="text-muted-foreground ml-auto flex items-center gap-1 text-xs font-normal">
                      <Info className="size-3" />
                      Rich text editor
                    </span>
                  </Label>
                  <div className="border-border/60 bg-muted/20 focus-within:border-primary/30 focus-within:bg-muted/30 overflow-hidden rounded-xl border transition-colors">
                    <Editor
                      className="min-h-[200px] bg-transparent"
                      content={field.state.value as JSONContent | undefined}
                      value={
                        field.state.value as JSONContent | string | undefined
                      }
                      onChange={(value) => field.handleChange(value)}
                    />
                  </div>
                  {field.state.meta.errors.map((error) => (
                    <p key={error} className="text-destructive text-sm">
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>
          )}
        </div>
      </FormSection>

      {/* Date & Time Section */}
      <FormSection
        icon={<Calendar className="size-5" />}
        title="Date & Time"
        description="When will your event take place?"
      >
        <FormGroup columns={2}>
          {/* Start Date Field */}
          <form.Field name="startDate">
            {(field) => (
              <FormFieldWrapper>
                <Label
                  htmlFor={field.name}
                  className="text-foreground flex items-center gap-2 text-sm font-medium"
                >
                  Start Date & Time
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="datetime-local"
                  value={field.state.value}
                  min={nowMinDateTime}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
                  disabled={disabled}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error} className="text-destructive text-sm">
                    {error}
                  </p>
                ))}
              </FormFieldWrapper>
            )}
          </form.Field>

          {/* End Date Field */}
          <form.Field name="endDate">
            {(field) => {
              const startDate = form.state.values.startDate;
              // End date must be at least 1 day after start date
              const endMin = startDate 
                ? addDaysToDateTimeLocalInputValue(startDate, 1)
                : nowMinDateTime;
              const endMax = startDate
                ? addDaysToDateTimeLocalInputValue(startDate, 15)
                : "";

              return (
                <FormFieldWrapper>
                  <Label
                    htmlFor={field.name}
                    className="text-foreground flex items-center gap-2 text-sm font-medium"
                  >
                    End Date & Time
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="datetime-local"
                    value={field.state.value}
                    min={endMin}
                    max={endMax || undefined}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
                    disabled={disabled}
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error} className="text-destructive text-sm">
                      {error}
                    </p>
                  ))}
                </FormFieldWrapper>
              );
            }}
          </form.Field>
        </FormGroup>
      </FormSection>

      {/* Location & Pricing Section */}
      <FormSection
        icon={<MapPin className="size-5" />}
        title="Location & Pricing"
        description="Where will your event be held and what's the cost?"
      >
        <FormGroup columns={2}>
          {/* Location Field */}
          <form.Field name="location">
            {(field) => (
              <FormFieldWrapper>
                <Label
                  htmlFor={field.name}
                  className="text-foreground flex items-center gap-2 text-sm font-medium"
                >
                  <MapPin className="text-muted-foreground size-3.5" />
                  Venue / Location
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., Convention Center, City"
                  className="placeholder:text-muted-foreground/50 h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
                  disabled={disabled}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error} className="text-destructive text-sm">
                    {error}
                  </p>
                ))}
              </FormFieldWrapper>
            )}
          </form.Field>

          {/* Price Field */}
          <form.Field name="priceAmount">
            {(field) => (
              <FormFieldWrapper>
                <Label
                  htmlFor={field.name}
                  className="text-foreground flex items-center gap-2 text-sm font-medium"
                >
                  <Coins className="text-muted-foreground size-3.5" />
                  Registration Price
                  <span className="bg-muted text-muted-foreground ml-auto rounded-md px-1.5 py-0.5 text-xs font-medium">
                    DZD
                  </span>
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min="0"
                  step="100"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(parseInt(e.target.value) || 0)
                  }
                  placeholder="0 for free event"
                  className="placeholder:text-muted-foreground/50 h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
                  disabled={disabled}
                />
                <p className="text-muted-foreground text-xs">
                  Enter 0 for a free event
                </p>
                {field.state.meta.errors.map((error) => (
                  <p key={error} className="text-destructive text-sm">
                    {error}
                  </p>
                ))}
              </FormFieldWrapper>
            )}
          </form.Field>
        </FormGroup>
      </FormSection>
    </div>
  );
}