import { updateProfileRouter } from "./update";
import { getProfileImageRouter } from "./getImage";
import { getProfileRouter } from "./get";
import { revokeSessionRouter } from "./revokeSession";

export const profileRouter = {
  update: updateProfileRouter,
  getImage: getProfileImageRouter,
  get: getProfileRouter,
  revokeSession: revokeSessionRouter,
};

// Re-export individual routers for backwards compatibility
export {
  updateProfileRouter,
  getProfileImageRouter,
  getProfileRouter,
  revokeSessionRouter,
};
