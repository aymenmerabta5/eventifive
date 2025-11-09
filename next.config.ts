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
    // cacheComponents: true,
    // Including cacheComponenets later because i need to wrap the entire pages with Suspense lel or i dont know
    output: "standalone",
};

export default config;
