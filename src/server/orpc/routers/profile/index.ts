import { updateProfileRouter } from "./update";
import { getProfileImageRouter } from "./getImage";
import { getProfileRouter } from "./get";

export const profileRouter = {
	update: updateProfileRouter,
	getImage: getProfileImageRouter,
	get: getProfileRouter,
};

// Re-export individual routers for backwards compatibility
export { updateProfileRouter, getProfileImageRouter, getProfileRouter };
