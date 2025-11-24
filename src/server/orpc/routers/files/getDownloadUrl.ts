import { z } from "zod";
import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import { files } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { generatePresignedDownloadUrl } from "@/server/bucket/presignedUrls";

const inputGetDownloadUrlSchema = z.object({
	fileId: z.string().uuid(),
});

const outputGetDownloadUrlSchema = z.object({
	downloadUrl: z.string(),
	expiresAt: z.date(),
	fileName: z.string(),
	fileSize: z.number(),
	contentType: z.string(),
});

export const getDownloadUrlRouter = protectedProcedure
	.route({ method: "POST", path: "/files/get-download-url" })
	.input(inputGetDownloadUrlSchema)
	.output(outputGetDownloadUrlSchema)
	.handler(async ({ context, input }) => {
		const { session } = context;

		if (!session?.user) {
			throw new ORPCError("UNAUTHORIZED");
		}

		const { fileId } = input;

		try {
			// Fetch file record
			const [file] = await db
				.select()
				.from(files)
				.where(eq(files.id, fileId));

			if (!file) {
				throw new ORPCError("NOT_FOUND", {
					message: "File not found",
				});
			}

			// Check if user has permission (owner or can access event files)
			if (file.userId !== session.user.id) {
				throw new ORPCError("FORBIDDEN", {
					message: "You do not have permission to access this file",
				});
			}

			// Check file status
			if (file.status !== "completed") {
				throw new ORPCError("BAD_REQUEST", {
					message: "File upload is not completed yet",
				});
			}

			// Generate presigned download URL
			const { downloadUrl, expiresAt } = await generatePresignedDownloadUrl(
				file.s3Key,
			);

			return {
				downloadUrl,
				expiresAt,
				fileName: file.fileName,
				fileSize: file.fileSize,
				contentType: file.contentType,
			};
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}
			console.error("Error generating download URL:", error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message:
					error instanceof Error
						? error.message
						: "Failed to generate download URL",
			});
		}
	});

