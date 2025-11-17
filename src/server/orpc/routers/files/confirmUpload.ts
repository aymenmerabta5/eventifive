import { z } from "zod";
import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import { files } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyFileExistsInS3 } from "@/server/bucket/presignedUrls";

const inputConfirmUploadSchema = z.object({
	fileId: z.string().uuid(),
});

const outputConfirmUploadSchema = z.object({
	success: z.boolean(),
	fileId: z.string(),
});

export const confirmUploadRouter = protectedProcedure
	.route({ method: "POST", path: "/files/confirm-upload" })
	.input(inputConfirmUploadSchema)
	.output(outputConfirmUploadSchema)
	.handler(async ({ context, input }) => {
		const { session } = context;

		if (!session?.user) {
			throw new ORPCError("UNAUTHORIZED");
		}

		const { fileId } = input;

		try {
			const [file] = await db
				.select()
				.from(files)
				.where(
					and(eq(files.id, fileId), eq(files.userId, session.user.id)),
				);

			if (!file) {
				throw new ORPCError("NOT_FOUND", {
					message: "File not found",
				});
			}

			if (file.status === "completed") {
				return {
					success: true,
					fileId,
				};
			}

			// Verify file exists in S3
			const exists = await verifyFileExistsInS3(file.s3Key);
			if (!exists) {
				throw new ORPCError("BAD_REQUEST", {
					message: "File not found in storage. Please upload the file first.",
				});
			}

			// Update status to completed
			await db
				.update(files)
				.set({
					status: "completed",
					updatedAt: new Date(),
				})
				.where(eq(files.id, fileId));

			return {
				success: true,
				fileId,
			};
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}
			console.error("Error confirming upload:", error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message:
					error instanceof Error ? error.message : "Failed to confirm upload",
			});
		}
	});

