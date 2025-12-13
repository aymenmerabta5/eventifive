import { getSubmissionRouter } from "./get";

export const submissionsRouter = {
	get: getSubmissionRouter,
};

// Re-export individual routers for backwards compatibility
export { getSubmissionRouter };
