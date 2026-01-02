import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "@/env";
import { captcha, customSession } from "better-auth/plugins";
import { db } from "@/server/db";
import { sendEmail } from "@/lib/sendEmail";
import ResetPasswordEmail from "@/lib/emails/ResetPasswordEmail";
import { userSubscription, userRoles, roles } from "@/server/db/schema";
import { eq, and, or } from "drizzle-orm";
import { generatePresignedDownloadUrl } from "@/server/bucket/presignedUrls";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, token }, _request) => {
      await sendEmail(
        user.email as unknown as string,
        "Reset your password",
        ResetPasswordEmail,
        {
          link:
            env.BETTER_AUTH_URL + `/reset-password/set-password?token=${token}`,
        },
        {
          from: env.RESEND_SENDER_EMAIL,
        },
      );
    },
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 3600,
    onPasswordReset: async ({ user }, _request) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  user: {
    additionalFields: {
      biography: {
        type: "string",
        required: false,
        input: false,
      },
      institution: {
        type: "string",
        required: false,
        input: false,
      },
      researchDomain: {
        type: "string",
        required: false,
        input: false,
        fieldName: "researchDomain",
      },
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    captcha({
      secretKey: env.CLOUDFLARE_TURNSTYLE_SK,
      provider: "cloudflare-turnstile",
    }),
    customSession(async ({ user, session }) => {
      const userId = user.id;

     
      const [subscription] = await db
        .select({ id: userSubscription.id })
        .from(userSubscription)
        .where(
          and(
            eq(userSubscription.userId, userId),

            eq(userSubscription.status, "active"),
          ),
        )
        .limit(1);

      const hasActiveSubscription = !!subscription;

      const [adminRole] = await db
        .select({ roleName: roles.name })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(and(eq(userRoles.userId, userId), eq(roles.name, "super_admin")))
        .limit(1);

      const isAdmin = !!adminRole;

      let profileImageUrl: string | null = null;
      if (user.image) {
        if (user.image.startsWith("https://lh3.googleusercontent.com")) {
          profileImageUrl = user.image;
        } else {
          try {
            const { downloadUrl } = await generatePresignedDownloadUrl(
              user.image,
            );
            profileImageUrl = downloadUrl;
          } catch {
            profileImageUrl = null;
          }
        }
      }

      return {
        user: {
          ...(user as typeof user & {
            biography?: string | null;
            institution?: string | null;
            researchDomain?: string | null;
          }),
          hasActiveSubscription,
          isAdmin,
          profileImageUrl,
        },
        session,
      };
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
