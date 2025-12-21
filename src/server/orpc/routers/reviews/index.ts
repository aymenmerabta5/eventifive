import { createReviewRouter } from "./create";
import { getMyReviewRouter } from "./getMine";

export const reviewsRouter = {
  create: createReviewRouter,
  getMine: getMyReviewRouter,
};

// Re-export individual routers for backwards compatibility
export { createReviewRouter, getMyReviewRouter };
