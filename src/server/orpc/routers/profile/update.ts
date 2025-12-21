import { protectedProcedure } from "../../index";
import { updateProfileSchema } from "@/lib/schemas/schemas";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { user } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

const outputUpdateProfileSchema = z.object({
  status: z.enum(["success", "error"]),
  message: z.string(),
});

export const updateProfileRouter = protectedProcedure
  .route({ method: "PATCH", path: "/profile/update" })
  .input(updateProfileSchema)
  .output(outputUpdateProfileSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;
    const { name, biography, institution, researchDomain } = input;
    const userData = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });
    if (!userData) {
      throw new ORPCError("USER_NOT_FOUND");
    }
    await db
      .update(user)
      .set({ name, biography, institution, researchDomain })
      .where(eq(user.id, session.user.id));

    return {
      status: "success" as const,
      message: "Profile updated successfully",
    };
  });
