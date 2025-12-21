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
    provider: "pg", // or "pg" or "mysql"
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
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
    additionalFields: {
      biography: {
        type: "string", // Using string instead of json because better-auth maps additionalFields to basic types
        required: false,
        input: false, // We handle updates manually via our own API
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

      // Check if user has an active subscription
      const [subscription] = await db
        .select({ id: userSubscription.id })
        .from(userSubscription)
        .where(
          and(
            eq(userSubscription.userId, userId),
            or(
              eq(userSubscription.status, "active"),
              eq(userSubscription.status, "pending"),
            ),
          ),
        )
        .limit(1);

      const hasActiveSubscription = !!subscription;

      // Check if user is an admin
      const [adminRole] = await db
        .select({ roleName: roles.name })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(and(eq(userRoles.userId, userId), eq(roles.name, "super_admin")))
        .limit(1);

      const isAdmin = !!adminRole;

      // Generate profile image URL
      let profileImageUrl: string | null = null;
      if (user.image) {
        if (user.image.startsWith("https://lh3.googleusercontent.com")) {
          // Google OAuth image - use directly
          profileImageUrl = user.image;
        } else {
          // S3 key - generate presigned URL
          try {
            const { downloadUrl } = await generatePresignedDownloadUrl(
              user.image,
            );
            profileImageUrl = downloadUrl;
          } catch {
            // If presigned URL fails, leave as null
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
