import { listPlansRouter } from "./listPlans";
import { createPlanRouter } from "./createPlan";
import { syncPlansRouter } from "./syncPlans";
import { getUserSubscriptionRouter } from "./getUserSubscription";

export const subscriptionRouter = {
  list: listPlansRouter,
  create: createPlanRouter,
  sync: syncPlansRouter,
  current: getUserSubscriptionRouter,
};
