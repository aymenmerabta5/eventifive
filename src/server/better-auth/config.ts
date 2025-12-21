import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "@/env";
import { captcha } from "better-auth/plugins";
import { db } from "@/server/db";
import { sendEmail } from "@/lib/sendEmail";
import ResetPasswordEmail from "@/lib/emails/ResetPasswordEmail";

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
  ],
});

export type Session = typeof auth.$Infer.Session;
