import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/better-auth";

/**
 * Routes that require authentication
 * Users will be redirected to /login if not authenticated
 */
const authRequiredRoutes = [
  "/dashboard",
  "/settings",
  "/invites",
  "/registrations",
  "/certificates",
  "/sessions",
  "/messages",
];

/**
 * Dynamic routes that require authentication
 * These are pattern-based matches
 */
const authRequiredPatterns = [
  /^\/events\/[^/]+\/register$/,
  /^\/events\/[^/]+\/review$/,
  /^\/events\/[^/]+\/communicator-reviews$/,
  /^\/events\/[^/]+\/calender$/,
  /^\/events\/[^/]+\/workshop$/,
  /^\/events\/[^/]+\/question-answer$/,
  /^\/events\/[^/]+\/sessions\/[^/]+\/qa$/,
];

/**
 * Routes that should redirect authenticated users away
 * (e.g., login page when already logged in)
 */
const authRedirectRoutes = ["/login", "/signup"];

/**
 * Check if the path requires authentication
 */
function requiresAuth(pathname: string): boolean {
  // Check static routes
  if (authRequiredRoutes.some((route) => pathname.startsWith(route))) {
    return true;
  }

  // Check dynamic patterns
  if (authRequiredPatterns.some((pattern) => pattern.test(pathname))) {
    return true;
  }

  return false;
}

/**
 * Check if authenticated users should be redirected away from this route
 */
function shouldRedirectAuthenticated(pathname: string): boolean {
  return authRedirectRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Get and validate session using Better Auth
 * This actually verifies the session in the database, not just cookie existence
 */
async function getValidSession(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return session;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // Static files like .ico, .png, etc.
  ) {
    return NextResponse.next();
  }

  // Only validate session if we need to check auth
  const needsAuthCheck = requiresAuth(pathname);
  const needsRedirectCheck = shouldRedirectAuthenticated(pathname);

  if (!needsAuthCheck && !needsRedirectCheck) {
    return NextResponse.next();
  }

  // Validate session with Better Auth (checks database, not just cookie)
  const session = await getValidSession(request);
  const isAuthenticated = !!session?.user;

  // Protected routes - redirect to login if not authenticated
  if (needsAuthCheck && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth pages - redirect to dashboard if already authenticated
  if (needsRedirectCheck && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
