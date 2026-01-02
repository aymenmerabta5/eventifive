import { env } from "@/env";
import { ChargilyClient } from "@chargily/chargily-pay";

/**
 * Chargily client instance
 * Null in development if CHARGILY_SK is not set
 */
export const client = env.CHARGILY_SK
  ? new ChargilyClient({
      api_key: env.CHARGILY_SK,
      mode: "test", // For now for the teacher to see it it will be test
    })
  : null;

/**
 * Get Chargily client or throw if not configured
 * Use this when Chargily operations are required
 */
export function getChargilyClient(): ChargilyClient {
  if (!client) {
    throw new Error(
      "Chargily is not configured. Set CHARGILY_SK environment variable.",
    );
  }
  return client;
}

/**
 * Check if Chargily is configured
 */
export function isChargilyConfigured(): boolean {
  return client !== null;
}

/**
 * Get base URL for callbacks based on environment
 */
export function getBaseUrl(): string {
  return env.BETTER_AUTH_URL;
}

/**
 * Generate success/failure URLs for checkout
 */
export function generateCallbackUrls(paymentId: string): {
  success_url: string;
  failure_url: string;
} {
  const baseUrl = getBaseUrl();
  return {
    success_url: `${baseUrl}/payment/success?paymentId=${paymentId}`,
    failure_url: `${baseUrl}/payment/failure?paymentId=${paymentId}`,
  };
}

/**
 * Generate webhook URL for Chargily
 */
export function getWebhookUrl(): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/api/webhooks/chargily`;
}
