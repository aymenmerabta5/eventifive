import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "@/env";
import { captcha } from "better-auth/plugins";
import { db } from "@/server/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 3600,
  },
  user: {
    additionalFields: {
      biography: {
        type: "string",
        required: false,
        input: false,
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
