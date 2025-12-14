import { useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/utils/orpc";
import { toDateTimeLocalInput } from "../utils";
import type { EventUpdateValues } from "../types";
import type { EventType } from "@/server/db/schema";

export function useEventPrefill(eventId: string | undefined) {
  const shouldFetch = Boolean(eventId);

  const { data, isPending, error } = useQuery({
    queryKey: ["my-events"],
    queryFn: () => client.events.myEvents(),
    enabled: shouldFetch,
    staleTime: 1000 * 60,
  });

  const event = useMemo(() => {
    if (!data?.events || !eventId) return null;
    return data.events.find((e) => e.id === eventId) ?? null;
  }, [data, eventId]);

  const {
    data: eventDetails,
    isPending: isEventDetailsPending,
    error: eventDetailsError,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => client.events.get({ id: eventId as string }),
    enabled: Boolean(eventId && event),
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (!shouldFetch || isPending) return;
    if (error) {
      toast.error("Failed to load events. Please try again.");
      return;
    }
    if (!event && eventId) {
      toast.error("Selected event not found. Please return to My Events.");
    }
  }, [shouldFetch, isPending, event, eventId, error]);

  useEffect(() => {
    if (!eventId || !event) return;
    if (isEventDetailsPending) return;
    if (eventDetailsError) {
      toast.error("Failed to load event details. Please try again.");
    }
  }, [eventId, event, isEventDetailsPending, eventDetailsError]);

  const initialValues: EventUpdateValues | null = useMemo(() => {
    if (!event) return null;
    const source = eventDetails ?? null;
    const bigDescription =
      source?.bigDescription !== null &&
      source?.bigDescription !== undefined &&
      typeof source.bigDescription === "object"
        ? (source.bigDescription as EventUpdateValues["bigDescription"])
        : undefined;
    return {
      eventId: event.id,
      title: event.title ?? "",
      description: event.smallDescription ?? "",
      bigDescription,
      type: (event.type ?? "") as "" | EventType,
      startDate: toDateTimeLocalInput(event.startDate),
      endDate: toDateTimeLocalInput(event.endDate),
      location: event.location ?? "",
      priceAmount: event.priceAmount ?? 0,
      priceCurrency: event.priceCurrency ?? "DZD",
    };
  }, [event, eventDetails]);

  return {
    initialValues,
    isPending: shouldFetch && isPending,
    notFound: shouldFetch && !isPending && !event,
    missingEventId: !eventId,
  };
}
