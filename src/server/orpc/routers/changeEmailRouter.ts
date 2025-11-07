import { changeEmailSchema } from "@/lib/schemas/schemas";
import { protectedProcedure } from "../index";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";

export const changeEmailRouter = protectedProcedure.input(changeEmailSchema).handler(async ({ context, input }) => {
    const { session } = context;
    const userData = await db.query.user.findFirst({
        where: eq(user.email, input.email),
    });
    if (userData) {
        throw new ORPCError("EMAIL_ALREADY_EXISTS");
    }
    await db.update(user).set({
        email: input.email,
    }).where(eq(user.id, session?.user?.id as string));
    return {
        success: true,
        message: "Email updated successfully",
    }
});