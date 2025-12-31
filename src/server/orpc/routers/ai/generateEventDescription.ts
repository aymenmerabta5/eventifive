import { z } from "zod";
import { rateLimitedAIProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { generateText } from "ai";
import { getOpenRouterClient, AI_MODEL } from "@/server/ai";
import {
  generateEventDescriptionInputSchema,
  generateEventDescriptionOutputSchema,
} from "@/lib/schemas/ai";
import { db } from "@/server/db";
import { userSubscription, userRoles, roles } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

const SYSTEM_PROMPT = `You are an expert event copywriter for academic and professional events.
Generate compelling, professional descriptions that attract attendees.
Be concise but informative. Use professional language appropriate for the event type.
Focus on the value attendees will gain from participating.
You MUST respond with valid JSON only - no markdown, no code blocks, just raw JSON.
NOTE: IF THE USER ASKS ANYTHING NOT RELATED TO THE EVENT OR THE DESCRIPTION, YOU MUST SAY THAT YOU ARE NOT AUTHORIZED TO RESPOND TO THAT!`;

const responseSchema = z.object({
  smallDescription: z.string(),
  bigDescription: z.object({
    type: z.literal("doc"),
    content: z.array(
      z.object({
        type: z.literal("paragraph"),
        content: z.array(
          z.object({
            type: z.literal("text"),
            text: z.string(),
          })
        ),
      })
    ),
  }),
});

/**
 * Check if user is super_admin
 */
async function isUserSuperAdmin(userId: string): Promise<boolean> {
  const [adminRole] = await db
    .select({ roleName: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(and(eq(userRoles.userId, userId), eq(roles.name, "super_admin")))
    .limit(1);
  return !!adminRole;
}

/**
 * Check if user has an active subscription
 */
async function hasActiveSubscription(userId: string): Promise<boolean> {
  const [subscription] = await db
    .select({ id: userSubscription.id })
    .from(userSubscription)
    .where(
      and(
        eq(userSubscription.userId, userId),
        eq(userSubscription.status, "active")
      )
    )
    .limit(1);
  return !!subscription;
}

export const generateEventDescriptionRouter = rateLimitedAIProcedure
  .route({ method: "POST", path: "/ai/generate-event-description" })
  .input(generateEventDescriptionInputSchema)
  .output(generateEventDescriptionOutputSchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;

    // Check authorization: must be admin OR have active subscription
    const [isAdmin, hasSubscription] = await Promise.all([
      isUserSuperAdmin(userId),
      hasActiveSubscription(userId),
    ]);

    if (!isAdmin && !hasSubscription) {
      throw new ORPCError("FORBIDDEN", {
        message:
          "AI features require an active subscription or admin privileges.",
      });
    }

    try {
      const openrouter = getOpenRouterClient();

      const eventTypeDisplay = input.eventType.replace(/_/g, " ");

      const { text } = await generateText({
        model: openrouter(AI_MODEL),
        system: SYSTEM_PROMPT,
        prompt: `Generate descriptions for this event:
Title: ${input.title}
Type: ${eventTypeDisplay}
${input.keywords ? `Keywords/Topics: ${input.keywords}` : ""}

Return a JSON object with exactly this structure:
{
  "smallDescription": "A compelling 1-2 sentence summary (max 150 words) for cards and listings",
  "bigDescription": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "First paragraph text here" }]
      },
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Second paragraph text here" }]
      }
    ]
  }
}

Generate 2-3 paragraphs for the bigDescription. Respond with valid JSON only.`,
      });

      // Parse and validate the response
      const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      const validated = responseSchema.parse(parsed);

      return {
        smallDescription: validated.smallDescription,
        bigDescription: validated.bigDescription,
      };
    } catch (error) {
      console.error("AI generation error:", error);
      if (error instanceof ORPCError) throw error;
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate description",
      });
    }
  });
