import { listUsersRouter } from "./listUsers";
import { listUsersPaginatedRouter } from "./listUsersPaginated";
import { deleteUserRouter } from "./deleteUser";
import { updateUserRoleRouter } from "./updateUserRole";

export const adminUsersRouter = {
  listUsers: listUsersRouter,
  listUsersPaginated: listUsersPaginatedRouter,
  deleteUser: deleteUserRouter,
  updateUserRole: updateUserRoleRouter,
};

export { listUsersRouter };
export { listUsersPaginatedRouter };
export { deleteUserRouter };
export { updateUserRoleRouter };
