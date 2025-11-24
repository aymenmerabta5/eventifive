import { z } from "zod";
import { protectedProcedure } from "../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { generatePresignedDownloadUrl } from "@/server/bucket/presignedUrls";

const inputGetProfileImageSchema = z.object({
	userId: z.string().optional(),
});

const outputGetProfileImageSchema = z.object({
	downloadUrl: z.string(),
	expiresAt: z.date(),
});

export const getProfileImageRouter = protectedProcedure
	.route({ method: "POST", path: "/get-profile-image" })
	.input(inputGetProfileImageSchema)
	.output(outputGetProfileImageSchema)
	.handler(async ({ context, input }) => {
		const { session } = context;

		if (!session?.user) {
			throw new ORPCError("UNAUTHORIZED");
		}

		const targetUserId = input.userId || session.user.id;

		try {
			// Fetch user profile
			const [userProfile] = await db
				.select()
				.from(user)
				.where(eq(user.id, targetUserId));

			if (!userProfile) {
				throw new ORPCError("NOT_FOUND", {
					message: "User not found",
				});
			}

			if (!userProfile.image) {
				throw new ORPCError("NOT_FOUND", {
					message: "User has no profile image",
				});
			}

			// Generate presigned download URL
			const { downloadUrl, expiresAt } = await generatePresignedDownloadUrl(
				userProfile.image,
			);

			return {
				downloadUrl,
				expiresAt,
			};
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}
			console.error("Error getting profile image:", error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message:
					error instanceof Error
						? error.message
						: "Failed to get profile image",
			});
		}
	});

