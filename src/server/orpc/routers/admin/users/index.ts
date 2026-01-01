import { listUsersRouter } from "./listUsers";
import { deleteUserRouter } from "./deleteUser";
import { updateUserRoleRouter } from "./updateUserRole";

export const adminUsersRouter = {
  listUsers: listUsersRouter,
  deleteUser: deleteUserRouter,
  updateUserRole: updateUserRoleRouter,
};

export { listUsersRouter };
export { deleteUserRouter };
export { updateUserRoleRouter };

