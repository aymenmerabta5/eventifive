import { ChargilyClient } from "@chargily/chargily-pay";

/**
 * Get Chargily client from environment variable
 * Returns null if CHARGILY_SK is not set
 */
export function getChargilyClient(): ChargilyClient | null {
  const apiKey = process.env.CHARGILY_SK;
  if (!apiKey) {
    return null;
  }

  return new ChargilyClient({
    api_key: apiKey,
    mode: process.env.NODE_ENV === "production" ? "live" : "test",
  });
}

/**
 * Check if Chargily is configured
 */
export function isChargilyConfigured(): boolean {
  return !!process.env.CHARGILY_SK;
}
