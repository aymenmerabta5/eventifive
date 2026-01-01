import type { RouterClient } from "@orpc/server";
import { eventsRouter } from "./events";
import { profileRouter } from "./profile";
import { filesRouter } from "./files";
import { paymentRouter } from "./payment";
import { subscriptionRouter } from "./subscription";
import { websocketsRouter } from "./websockets";
import { submissionsRouter } from "./submissions";
import { reviewsRouter } from "./reviews";
import { sessionsRouter } from "./sessions";
import { adminRouter } from "./admin";
import { organizerRouter } from "./organizer";
import { certificatesRouter } from "./certificates";
import { badgesRouter } from "./badges";
import { aiRouter } from "./ai";
import { workshopsRouter } from "./workshops";
import { communicatorsRouter } from "./communicators";

/**
 * Main application router
 *
 * Organized by domain:
 * - admin: Admin-only routes (dashboard stats, management)
 * - organizer: Organizer routes (dashboard, events, etc.)
 * - events: Event CRUD operations (create, update, delete, list, listByType, myEvents)
 * - profile: User profile management (update, uploadImage, getImage)
 * - files: File storage operations (requestUpload, confirmUpload, getDownloadUrl, list, delete)
 * - payment: Payment processing (createCheckout, getStatus, list)
 * - subscription: Subscription management (listPlans, createPlan, syncPlans, getCurrent)
 * - websocketsRouter: Real-time features via WebSocket
 *   - messages: Real-time messaging (send, listConversations, listMessages, createConversation, subscribe, subscribePresence, getPresence)
 *   - qa: Session Q&A (ask, list, like, answer, delete, subscribe)
 * - submissions: Submission operations (get)
 * - reviews: Review operations (create)
 * - sessions: Program session and room management (createRoom, updateRoom, deleteRoom, listRooms, createSession, updateSession, deleteSession, listSessions, getSession)
 * - certificates: Certificate management (getEligibleRecipients, generate, listByEvent, listMyCertificates, download, verify, revoke)
 * - badges: Badge management (listMyBadges, download, verify, listByEvent, revoke)
 * - workshops: Workshop proposal management (propose, listProposals, get, accept, reject, listMine)
 * - communicators: Communicator management (add, remove, list)
 */
export const appRouter = {
  admin: adminRouter,
  organizer: organizerRouter,
  events: eventsRouter,
  profile: profileRouter,
  files: filesRouter,
  payment: paymentRouter,
  subscription: subscriptionRouter,
  websocketsRouter: websocketsRouter,
  submissions: submissionsRouter,
  reviews: reviewsRouter,
  sessions: sessionsRouter,
  certificates: certificatesRouter,
  badges: badgesRouter,
  ai: aiRouter,
  workshops: workshopsRouter,
  communicators: communicatorsRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
