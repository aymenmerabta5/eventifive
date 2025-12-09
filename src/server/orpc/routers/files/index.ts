import { requestUploadRouter } from "./requestUpload";
import { confirmUploadRouter } from "./confirmUpload";
import { getDownloadUrlRouter } from "./getDownloadUrl";
import { listFilesRouter } from "./listFiles";
import { deleteFileRouter } from "./deleteFile";

export const filesRouter = {
	requestUpload: requestUploadRouter,
	confirmUpload: confirmUploadRouter,
	getDownloadUrl: getDownloadUrlRouter,
	list: listFilesRouter,
	delete: deleteFileRouter,
};

// Re-export individual routers for backwards compatibility
export {
	requestUploadRouter,
	confirmUploadRouter,
	getDownloadUrlRouter,
	listFilesRouter,
	deleteFileRouter,
};
