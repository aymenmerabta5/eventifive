import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { env } from "@/env";

/**
 * Get OpenRouter client instance
 * Throws if OPENROUTER_API_KEY is not configured
 */
export function getOpenRouterClient() {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }
  return createOpenRouter({
    apiKey: env.OPENROUTER_API_KEY,
  });
}

/**
 * Default AI model to use for generation
 * Using Nvidia's nemotron 30b model it has high throughput and low latency
 */
export const AI_MODEL = "nvidia/nemotron-3-nano-30b-a3b:free";
