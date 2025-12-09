import { updateProfileRouter } from "./update";
import { uploadImageRouter } from "./uploadImage";
import { getProfileImageRouter } from "./getImage";

export const profileRouter = {
	update: updateProfileRouter,
	uploadImage: uploadImageRouter,
	getImage: getProfileImageRouter,
};

// Re-export individual routers for backwards compatibility
export { updateProfileRouter, uploadImageRouter, getProfileImageRouter };
