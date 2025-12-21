/**
 * Test utilities for the Eventifive application
 *
 * Usage in scripts:
 *   import { simulateWebhook, createTestRegistrationPayment } from "@/server/tests";
 *
 * Available modules:
 *   - webhookSimulator: Simulate Chargily webhook events
 *   - createTestPayment: Create test pending payments
 *   - paymentQueries: Query pending payments
 *   - utils: Colors and logging helpers
 */

// Webhook simulation
export {
  simulateWebhook,
  simulateWebhookBatch,
  simulatePaidById,
  simulateFailedById,
  simulateExpiredById,
  type SimulateWebhookResult,
} from "./webhookSimulator";

// Create test payments
export {
  createTestRegistrationPayment,
  createTestSubscriptionPayment,
  listPaidEvents,
  listUsers,
  listSubscriptionPlans,
  type CreateTestPaymentResult,
} from "./createTestPayment";

// Payment queries
export {
  getPendingPaymentsWithDetails,
  getPaymentById,
  getPendingPaymentsByUserId,
  getPendingPaymentsByEventId,
  getPendingSubscriptionPayments,
  getPendingRegistrationPayments,
  printPendingPayments,
  type PaymentRecord,
  type PaymentWithDetails,
} from "./paymentQueries";

// Utilities
export {
  colors,
  log,
  logSuccess,
  logError,
  logWarning,
  logInfo,
  type WebhookEventType,
  type ChargilyWebhookData,
  type ChargilyWebhookEvent,
} from "./utils";
