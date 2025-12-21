import { getSubmissionRouter } from "./get";
import { listAssignedSubmissionsRouter } from "./listAssigned";
import { listForOrganizerRouter } from "./listForOrganizer";
import { updateSubmissionStatusRouter } from "./updateStatus";

export const submissionsRouter = {
  get: getSubmissionRouter,
  listAssigned: listAssignedSubmissionsRouter,
  listForOrganizer: listForOrganizerRouter,
  updateStatus: updateSubmissionStatusRouter,
};

// Re-export individual routers for backwards compatibility
export { getSubmissionRouter };
export { listAssignedSubmissionsRouter };
export { listForOrganizerRouter };
export { updateSubmissionStatusRouter };
