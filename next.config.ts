/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.ts";
import type { NextConfig } from "next";

/** @type {import("next").NextConfig} */
const config: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  cacheComponents: true,
  // output: "standalone", later
  serverExternalPackages: ["better-auth"],
};

export default config;
