import { z } from "zod";

// ============================================================================
// Enums
// ============================================================================

export const pollTypeSchema = z.enum(["single", "multiple"]);
export type PollType = z.infer<typeof pollTypeSchema>;

// ============================================================================
// Input Schemas
// ============================================================================

export const createPollSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  question: z.string().min(1, "Question is required").max(500, "Question too long"),
  pollType: pollTypeSchema.default("single"),
  options: z
    .array(z.string().min(1, "Option cannot be empty").max(200, "Option too long"))
    .min(2, "At least 2 options required")
    .max(10, "Maximum 10 options allowed"),
});

export type CreatePollInput = z.infer<typeof createPollSchema>;

export const voteSchema = z.object({
  pollId: z.string().min(1, "Poll ID is required"),
  optionIds: z.array(z.number()).min(1, "Select at least one option"),
});

export type VoteInput = z.infer<typeof voteSchema>;

export const closePollSchema = z.object({
  pollId: z.string().min(1, "Poll ID is required"),
});

export type ClosePollInput = z.infer<typeof closePollSchema>;

export const listPollsSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  includeResults: z.boolean().default(true),
});

export type ListPollsInput = z.infer<typeof listPollsSchema>;

export const getResultsSchema = z.object({
  pollId: z.string().min(1, "Poll ID is required"),
});

export type GetResultsInput = z.infer<typeof getResultsSchema>;

// ============================================================================
// Output Schemas
// ============================================================================

export const pollOptionSchema = z.object({
  id: z.number(),
  text: z.string(),
  displayOrder: z.number(),
  voteCount: z.number().optional(),
  percentage: z.number().optional(),
});

export type PollOption = z.infer<typeof pollOptionSchema>;

export const pollSchema = z.object({
  id: z.string(),
  question: z.string(),
  pollType: pollTypeSchema,
  isActive: z.boolean(),
  createdBy: z.string(),
  createdByName: z.string(),
  createdAt: z.date(),
  closedAt: z.date().nullable(),
  options: z.array(pollOptionSchema),
  totalVotes: z.number().optional(),
  userVotedOptionIds: z.array(z.number()),
});

export type Poll = z.infer<typeof pollSchema>;

export const pollResultOptionSchema = z.object({
  optionId: z.number(),
  text: z.string(),
  voteCount: z.number(),
  percentage: z.number(),
});

export type PollResultOption = z.infer<typeof pollResultOptionSchema>;

export const pollResultsSchema = z.object({
  pollId: z.string(),
  totalVotes: z.number(),
  options: z.array(pollResultOptionSchema),
});

export type PollResults = z.infer<typeof pollResultsSchema>;

// ============================================================================
// Event Schemas (for WebSocket)
// ============================================================================

export const pollCreatedEventSchema = z.object({
  type: z.literal("poll_created"),
  poll: z.object({
    id: z.string(),
    sessionId: z.string(),
    question: z.string(),
    pollType: pollTypeSchema,
    isActive: z.boolean(),
    createdBy: z.string(),
    createdByName: z.string(),
    createdAt: z.date(),
    options: z.array(
      z.object({
        id: z.number(),
        text: z.string(),
        displayOrder: z.number(),
      })
    ),
  }),
});

export type PollCreatedEvent = z.infer<typeof pollCreatedEventSchema>;

export const pollClosedEventSchema = z.object({
  type: z.literal("poll_closed"),
  pollId: z.string(),
  closedAt: z.date(),
  results: pollResultsSchema,
});

export type PollClosedEvent = z.infer<typeof pollClosedEventSchema>;

export const voteEventSchema = z.object({
  type: z.enum(["vote_cast", "vote_changed"]),
  pollId: z.string(),
  results: pollResultsSchema,
});

export type VoteEvent = z.infer<typeof voteEventSchema>;

export const pollEventSchema = z.union([
  pollCreatedEventSchema,
  pollClosedEventSchema,
  voteEventSchema,
]);

export type PollEvent = z.infer<typeof pollEventSchema>;
