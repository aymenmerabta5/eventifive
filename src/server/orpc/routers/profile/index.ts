import { updateProfileRouter } from "./update";
import { uploadImageRouter } from "./uploadImage";
import { getProfileImageRouter } from "./getImage";
import { getProfileRouter } from "./get";

export const profileRouter = {
	update: updateProfileRouter,
	uploadImage: uploadImageRouter,
	getImage: getProfileImageRouter,
	get: getProfileRouter,
};

// Re-export individual routers for backwards compatibility
export { updateProfileRouter, uploadImageRouter, getProfileImageRouter, getProfileRouter };
