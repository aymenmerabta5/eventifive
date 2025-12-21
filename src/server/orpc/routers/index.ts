import type { RouterClient } from "@orpc/server";
import { eventsRouter } from "./events";
import { profileRouter } from "./profile";
import { filesRouter } from "./files";
import { paymentRouter } from "./payment";
import { subscriptionRouter } from "./subscription";
import { messagesRouter } from "./websockets";
import { submissionsRouter } from "./submissions";
import { reviewsRouter } from "./reviews";
import { sessionsRouter } from "./sessions";
import { dashboardRouter } from "./dashboard";

/**
 * Main application router
 *
 * Organized by domain:
 * - dashboard: Dashboard statistics and charts (getStats, getChartData)
 * - events: Event CRUD operations (create, update, delete, list, listByType, myEvents)
 * - profile: User profile management (update, uploadImage, getImage)
 * - files: File storage operations (requestUpload, confirmUpload, getDownloadUrl, list, delete)
 * - payment: Payment processing (createCheckout, getStatus, list)
 * - subscription: Subscription management (listPlans, createPlan, syncPlans, getCurrent)
 * - messages: Real-time messaging (send, listConversations, listMessages, createConversation, subscribe)
 * - submissions: Submission operations (get)
 * - reviews: Review operations (create)
 * - sessions: Program session and room management (createRoom, updateRoom, deleteRoom, listRooms, createSession, updateSession, deleteSession, listSessions, getSession)
 */
export const appRouter = {
  dashboard: dashboardRouter,
  events: eventsRouter,
  profile: profileRouter,
  files: filesRouter,
  payment: paymentRouter,
  subscription: subscriptionRouter,
  messages: messagesRouter,
  submissions: submissionsRouter,
  reviews: reviewsRouter,
  sessions: sessionsRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
