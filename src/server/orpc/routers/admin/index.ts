import { adminDashboardRouter } from "./dashboard";
import { adminUsersRouter } from "./users";

export const adminRouter = {
  dashboard: adminDashboardRouter,
  users: adminUsersRouter,
};

export { adminDashboardRouter };
export { adminUsersRouter };
