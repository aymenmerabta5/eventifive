import { z } from "zod";
import { eventTypeValues } from "@/server/db/schema/enums";

// =============================================================================
// Input Schema
// =============================================================================

export const generateEventDescriptionInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  eventType: z.enum(eventTypeValues),
  keywords: z.string().max(500).optional(),
});

export type GenerateEventDescriptionInput = z.infer<
  typeof generateEventDescriptionInputSchema
>;

// =============================================================================
// Output Schema
// =============================================================================

/**
 * TipTap JSONContent structure for rich text editor
 * This is the format expected by the TipTap editor component
 */
const tiptapContentSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.record(z.unknown())),
});

export const generateEventDescriptionOutputSchema = z.object({
  smallDescription: z.string().max(500),
  bigDescription: tiptapContentSchema,
});

export type GenerateEventDescriptionOutput = z.infer<
  typeof generateEventDescriptionOutputSchema
>;
