import type { RouterClient } from "@orpc/server";
import { healthCheck } from "./healthCheck";
import { privateData } from "./privateData";
import { changeEmailRouter } from "./changeEmailRouter";

export const appRouter = {
	healthCheck,
	privateData,
	changeEmailRouter
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
