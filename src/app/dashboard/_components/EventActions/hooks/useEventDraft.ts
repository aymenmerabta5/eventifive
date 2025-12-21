import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { createDraftEventSchema } from "@/lib/schemas/schemas";
import type { JSONContent } from "@tiptap/react";

interface CreateDraftInput {
  title: string;
  description: string;
  bigDescription?: JSONContent;
  type: string;
  startDate: string;
  endDate: string;
  location: string;
  priceAmount: number;
  priceCurrency: string;
}

interface CreateEventResponse {
  status: "success" | "error";
  message: string;
  eventId?: string;
  errors?: Record<string, string[]>;
}

export function useEventDraft() {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const createDraft = async (
    data: CreateDraftInput,
    images: File[],
  ): Promise<string | null> => {
    // Validate locally first
    const parsed = createDraftEventSchema.safeParse(data);
    if (!parsed.success) {
      toast.error("Please fill all required fields.");
      return null;
    }

    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("title", parsed.data.title);
      formData.append("description", parsed.data.description);
      if (parsed.data.bigDescription !== undefined) {
        formData.append(
          "bigDescription",
          JSON.stringify(parsed.data.bigDescription),
        );
      }
      formData.append("type", parsed.data.type);
      formData.append("startDate", parsed.data.startDate);
      formData.append("endDate", parsed.data.endDate);
      formData.append("location", parsed.data.location ?? "");
      formData.append("priceAmount", (parsed.data.priceAmount ?? 0).toString());
      formData.append("priceCurrency", parsed.data.priceCurrency ?? "DZD");

      for (const file of images) {
        formData.append("images", file);
      }

      const res = await fetch("/api/create-event", {
        method: "POST",
        body: formData,
      });

      const result = (await res.json()) as CreateEventResponse;

      if (!res.ok || !result.eventId) {
        throw new Error(result.message || "Failed to create event");
      }

      toast.success("Draft event created.");
      void queryClient.invalidateQueries({ queryKey: ["my-events"] });

      return result.eventId;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create event";
      toast.error(message);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return { createDraft, isCreating };
}
