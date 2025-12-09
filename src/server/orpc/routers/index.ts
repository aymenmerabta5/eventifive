import type { RouterClient } from "@orpc/server";
import { profileRouter } from "./profileRouter";
import { eventRouter } from "./eventRouter";
import { updateEventRouter } from "./updateEvent";
import { deleteEventRouter } from "./deleteEvent";
import { filesRouter } from "./files";
import { uploadImageRouter } from "./uploadImage";
import { getProfileImageRouter } from "./getProfileImage";
import { websocketsRouter } from "./websockets";
import { listEventsRouter } from "./listEvents";
import { listEventsByTypeRouter } from "./listEventsByType";
import { myEventsRouter } from "./myEvents";
import { paymentRouter } from "./payment";
import { subscriptionRouter } from "./subscription";

export const appRouter = {
	profileRouter,
	eventRouter,
	updateEventRouter,
	deleteEventRouter,
	filesRouter,
	uploadImageRouter,
	getProfileImageRouter,
	websocketsRouter,
	listEventsRouter,
	listEventsByTypeRouter,
	myEventsRouter,
	paymentRouter,
	subscriptionRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
