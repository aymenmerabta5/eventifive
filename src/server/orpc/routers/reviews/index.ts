import { createReviewRouter } from "./create";

export const reviewsRouter = {
	create: createReviewRouter,
};

// Re-export individual routers for backwards compatibility
export { createReviewRouter };
