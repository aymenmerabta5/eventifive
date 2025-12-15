import { getSubmissionRouter } from "./get";
import { listAssignedSubmissionsRouter } from "./listAssigned";
import { listForOrganizerRouter } from "./listForOrganizer";

export const submissionsRouter = {
	get: getSubmissionRouter,
	listAssigned: listAssignedSubmissionsRouter,
	listForOrganizer: listForOrganizerRouter,
};

// Re-export individual routers for backwards compatibility
export { getSubmissionRouter };
export { listAssignedSubmissionsRouter };
export { listForOrganizerRouter };
