import type { RouterClient } from "@orpc/server";
import { profileRouter } from "./profileRouter";

export const appRouter = {
	profileRouter
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
