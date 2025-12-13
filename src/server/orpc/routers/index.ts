import type { RouterClient } from "@orpc/server";
import { eventsRouter } from "./events";
import { profileRouter } from "./profile";
import { filesRouter } from "./files";
import { paymentRouter } from "./payment";
import { subscriptionRouter } from "./subscription";
import { messagesRouter } from "./websockets";
import { submissionsRouter } from "./submissions";
import { reviewsRouter } from "./reviews";

/**
 * Main application router
 *
 * Organized by domain:
 * - events: Event CRUD operations (create, update, delete, list, listByType, myEvents)
 * - profile: User profile management (update, uploadImage, getImage)
 * - files: File storage operations (requestUpload, confirmUpload, getDownloadUrl, list, delete)
 * - payment: Payment processing (createCheckout, getStatus, list)
 * - subscription: Subscription management (listPlans, createPlan, syncPlans, getCurrent)
 * - messages: Real-time messaging (send, listConversations, listMessages, createConversation, subscribe)
 * - submissions: Submission operations (get)
 * - reviews: Review operations (create)
 */
export const appRouter = {
	events: eventsRouter,
	profile: profileRouter,
	files: filesRouter,
	payment: paymentRouter,
	subscription: subscriptionRouter,
	messages: messagesRouter,
	submissions: submissionsRouter,
	reviews: reviewsRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
