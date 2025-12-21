import { useForm } from "@tanstack/react-form";
import {
  createDraftEventSchema,
  updateEventSchema,
} from "@/lib/schemas/schemas";
import type { EventFormMode, EventUpdateValues } from "../types";
import type { JSONContent } from "@tiptap/react";
import type { EventType } from "@/server/db/schema";

const defaultValues: EventUpdateValues = {
  eventId: "",
  title: "",
  description: "",
  bigDescription: undefined,
  type: "" as "" | EventType,
  startDate: "",
  endDate: "",
  location: "",
  priceAmount: 0,
  priceCurrency: "DZD",
};

export function useEventForm(
  mode: EventFormMode,
  initialValues?: Partial<EventUpdateValues>,
) {
  const schema = mode === "create" ? createDraftEventSchema : updateEventSchema;

  return useForm({
    defaultValues: {
      eventId: initialValues?.eventId ?? defaultValues.eventId,
      title: initialValues?.title ?? defaultValues.title,
      description: initialValues?.description ?? defaultValues.description,
      bigDescription:
        initialValues?.bigDescription ?? defaultValues.bigDescription,
      type: initialValues?.type ?? defaultValues.type,
      startDate: initialValues?.startDate ?? defaultValues.startDate,
      endDate: initialValues?.endDate ?? defaultValues.endDate,
      location: initialValues?.location ?? defaultValues.location,
      priceAmount: initialValues?.priceAmount ?? defaultValues.priceAmount,
      priceCurrency:
        initialValues?.priceCurrency ?? defaultValues.priceCurrency,
    } as {
      eventId: string;
      title: string;
      description: string;
      bigDescription: JSONContent | undefined;
      type: "" | EventType;
      startDate: string;
      endDate: string;
      location: string;
      priceAmount: number;
      priceCurrency: string;
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = schema.safeParse(value);
        if (!result.success) {
          return result.error.formErrors.fieldErrors;
        }
      },
    },
  });
}

export type EventFormInstance = ReturnType<typeof useEventForm>;
