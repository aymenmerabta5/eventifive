import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    BETTER_AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),

    // Better Auth
    BETTER_AUTH_URL: z.string().url(),

    // Email (Resend)
    RESEND_API_KEY: z.string().min(1),
    RESEND_SENDER_EMAIL: z.string().email(),

    // Cloudflare Turnstile (Server-side secret)
    CLOUDFLARE_TURNSTYLE_SK: z.string().min(1),

    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),

    // CORS
    CORS_ORIGIN: z.string().url().default("http://localhost:3000"),

    // Optional
    OPEN_AI_API_KEY: z.string().min(1).optional(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    ARCJET_API: z.string().min(1),

    // Cloudflare R2
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    S3_BUCKET_NAME: z.string().min(1),
    CHARGILY_SK:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    // Native Redis URL for pub/sub (from Upstash: rediss://default:password@endpoint:port)
    REDIS_URL: z.string().min(1),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_CLOUDFLARE_TURNSTYLE_PK: z.string().min(1),
    NEXT_PUBLIC_WEBSOCKET_URL: z.string().url().default("ws://localhost:8081"),
    NEXT_PUBLIC_CHARGILY_PK:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    NEXT_PUBLIC_S3_ENDPOINT: z.string().url(),
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_SENDER_EMAIL: process.env.RESEND_SENDER_EMAIL,
    CLOUDFLARE_TURNSTYLE_SK: process.env.CLOUDFLARE_TURNSTYLE_SK,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_CLOUDFLARE_TURNSTYLE_PK:
      process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTYLE_PK,
    ARCJET_API: process.env.ARCJET_API,
    NEXT_PUBLIC_S3_ENDPOINT: process.env.NEXT_PUBLIC_S3_ENDPOINT,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
    CHARGILY_SK: process.env.CHARGILY_SK,
    NEXT_PUBLIC_CHARGILY_PK: process.env.NEXT_PUBLIC_CHARGILY_PK,
    REDIS_URL: process.env.REDIS_URL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
