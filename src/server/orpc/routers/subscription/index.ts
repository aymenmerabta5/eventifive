import { listPlansRouter } from "./listPlans";
import { createPlanRouter } from "./createPlan";
import { syncPlansRouter } from "./syncPlans";
import { getUserSubscriptionRouter } from "./getUserSubscription";

export const subscriptionRouter = {
  listPlans: listPlansRouter,
  createPlan: createPlanRouter,
  syncPlans: syncPlansRouter,
  getCurrent: getUserSubscriptionRouter,
};

// Re-export individual routers for backwards compatibility
export {
  listPlansRouter,
  createPlanRouter,
  syncPlansRouter,
  getUserSubscriptionRouter,
};
