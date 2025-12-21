import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateEventSchema } from "@/lib/schemas/schemas";
import type { EventType } from "@/server/db/schema";
import type { JSONContent } from "@tiptap/react";

interface UpdateEventInput {
  eventId: string;
  title: string;
  description?: string;
  bigDescription?: JSONContent | null;
  type: EventType;
  startDate: string;
  endDate: string;
  location?: string;
  priceAmount?: number;
  priceCurrency?: string;
}

interface UpdateEventResponse {
  status: "success" | "error";
  message: string;
  eventId?: string;
  images?: {
    deleted: number;
    uploaded: number;
    deleteFailed: string[];
    uploadFailed: string[];
  };
}

export function useEventUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const updateEvent = async (
    data: UpdateEventInput,
    newImages: File[] = [],
    removeImageIds: string[] = [],
  ): Promise<boolean> => {
    // Validate locally first
    const parsed = updateEventSchema.safeParse(data);
    if (!parsed.success) {
      toast.error("Please fill all required fields.");
      return false;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("eventId", parsed.data.eventId);
      formData.append("title", parsed.data.title);
      if (parsed.data.description) {
        formData.append("description", parsed.data.description);
      }
      if (parsed.data.bigDescription !== undefined) {
        formData.append(
          "bigDescription",
          JSON.stringify(parsed.data.bigDescription),
        );
      }
      formData.append("type", parsed.data.type);
      formData.append("startDate", parsed.data.startDate);
      formData.append("endDate", parsed.data.endDate);
      if (parsed.data.location) {
        formData.append("location", parsed.data.location);
      }
      if (parsed.data.priceAmount !== undefined) {
        formData.append("priceAmount", parsed.data.priceAmount.toString());
      }
      if (parsed.data.priceCurrency) {
        formData.append("priceCurrency", parsed.data.priceCurrency);
      }

      // Add images to remove
      for (const fileId of removeImageIds) {
        formData.append("removeImageIds", fileId);
      }

      // Add new images
      for (const file of newImages) {
        formData.append("images", file);
      }

      const res = await fetch("/api/update-event", {
        method: "POST",
        body: formData,
      });

      const result = (await res.json()) as UpdateEventResponse;

      if (!res.ok) {
        throw new Error(result.message || "Failed to update event");
      }

      toast.success(result.message || "Event updated successfully");
      void queryClient.invalidateQueries({ queryKey: ["my-events"] });
      void queryClient.invalidateQueries({
        queryKey: ["event-images", data.eventId],
      });
      router.push("/dashboard?view=my-events");

      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update event";
      toast.error(message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateEvent, isUpdating };
}
