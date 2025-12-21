import { drizzle } from "drizzle-orm/bun-sql";
import { SQL } from "bun";

import { env } from "@/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: SQL | undefined;
};

const client = globalForDb.client ?? new SQL(env.DATABASE_URL);
if (env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle({ client, schema });
