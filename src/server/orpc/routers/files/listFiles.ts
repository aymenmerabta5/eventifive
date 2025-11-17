import { z } from "zod";
import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import { files } from "@/server/db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";

const inputListFilesSchema = z.object({
	fileType: z.enum(["image", "document"]).optional(),
	eventId: z.string().optional(),
	limit: z.number().int().positive().max(100).optional().default(50),
	offset: z.number().int().min(0).optional().default(0),
});

const fileSchema = z.object({
	id: z.string(),
	fileName: z.string(),
	fileType: z.enum(["image", "document"]),
	fileSize: z.number(),
	contentType: z.string(),
	status: z.enum(["pending", "completed", "failed"]),
	eventId: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

const outputListFilesSchema = z.object({
	files: z.array(fileSchema),
	total: z.number(),
});

export const listFilesRouter = protectedProcedure
	.route({ method: "POST", path: "/files/list" })
	.input(inputListFilesSchema)
	.output(outputListFilesSchema)
	.handler(async ({ context, input }) => {
		const { session } = context;

		if (!session?.user) {
			throw new ORPCError("UNAUTHORIZED");
		}

		const { fileType, eventId, limit, offset } = input;

		try {
			// Build where conditions
			const conditions = [eq(files.userId, session.user.id)];

			if (fileType) {
				conditions.push(eq(files.fileType, fileType));
			}

			if (eventId !== undefined) {
				if (eventId === "") {
					// Empty string means files without eventId (profile pictures)
					conditions.push(isNull(files.eventId));
				} else {
					conditions.push(eq(files.eventId, eventId));
				}
			}

			// Fetch files
			const userFiles = await db
				.select({
					id: files.id,
					fileName: files.fileName,
					fileType: files.fileType,
					fileSize: files.fileSize,
					contentType: files.contentType,
					status: files.status,
					eventId: files.eventId,
					createdAt: files.createdAt,
					updatedAt: files.updatedAt,
				})
				.from(files)
				.where(and(...conditions))
				.orderBy(desc(files.createdAt))
				.limit(limit)
				.offset(offset);

			// Get total count
			const [countResult] = await db
				.select({ count: files.id })
				.from(files)
				.where(and(...conditions));

			return {
				files: userFiles,
				total: countResult ? 1 : 0,
			};
		} catch (error) {
			console.error("Error listing files:", error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: error instanceof Error ? error.message : "Failed to list files",
			});
		}
	});

