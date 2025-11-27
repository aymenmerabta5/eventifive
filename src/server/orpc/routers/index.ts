import type { RouterClient } from "@orpc/server";
import { profileRouter } from "./profileRouter";
import { eventRouter } from "./eventRouter";
import { updateEventRouter } from "./updateEvent";
import { filesRouter } from "./files";
import { uploadImageRouter } from "./uploadImage";
import { getProfileImageRouter } from "./getProfileImage";
import { websocketsRouter } from "./websockets";

export const appRouter = {
	profileRouter,
	eventRouter,
	updateEventRouter,
	filesRouter,
	uploadImageRouter,
	getProfileImageRouter,
	websocketsRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
