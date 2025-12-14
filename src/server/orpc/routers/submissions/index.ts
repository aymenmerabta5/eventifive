import { getSubmissionRouter } from "./get";
import { listAssignedSubmissionsRouter } from "./listAssigned";

export const submissionsRouter = {
	get: getSubmissionRouter,
	listAssigned: listAssignedSubmissionsRouter,
};

// Re-export individual routers for backwards compatibility
export { getSubmissionRouter };
export { listAssignedSubmissionsRouter };
