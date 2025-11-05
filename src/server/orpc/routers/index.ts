import type { RouterClient } from "@orpc/server";
import { healthCheck } from "./healthCheck";
import { privateData } from "./privateData";

export const appRouter = {
	healthCheck,
	privateData
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
