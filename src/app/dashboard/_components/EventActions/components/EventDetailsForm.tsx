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
import { Calendar, MapPin, Type, FileText, DollarSign } from "lucide-react";
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
  return (
    <div className="space-y-6">
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
              disabled={disabled}
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
                className="flex items-center gap-2 text-sm font-medium"
              >
                <FileText className="size-4" />
                Event Big Description
              </Label>
              <Editor
                className="bg-background w-full"
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
      )}

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

        {/* End Date Field */}
        <form.Field name="endDate">
          {(field) => {
            const startDate = form.state.values.startDate;
            const endMin = startDate || nowMinDateTime;
            const endMax = startDate
              ? addDaysToDateTimeLocalInputValue(startDate, 15)
              : "";

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
                  min={endMin}
                  max={endMax || undefined}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full"
                  disabled={disabled}
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
              onChange={(e) =>
                field.handleChange(parseInt(e.target.value) || 0)
              }
              placeholder="0 for free event"
              className="w-full"
              disabled={disabled}
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
    </div>
  );
}
