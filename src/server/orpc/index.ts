import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";
import { db } from "@/server/db";
import { roles, userRoles } from "@/server/db/schema";
import { eq } from "drizzle-orm";



export const o = os.$context<Context>();


const requireAdmin = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  const user = await db.select({
    roleName: roles.name,
  }).from(userRoles).where(eq(userRoles.userId, context.session.user.id)).innerJoin(roles, eq(userRoles.roleId, roles.id));
  if (!user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  if (user[0]?.roleName !== "super_admin") {
    throw new ORPCError("FORBIDDEN");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

export const publicProcedure = o;

export const protectedProcedure = publicProcedure.use(requireAuth);

export const adminProcedure = protectedProcedure.use(requireAdmin);