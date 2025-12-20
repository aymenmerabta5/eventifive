---
name: authentication
description: Manage authentication with Better Auth - login, signup, sessions, OAuth, password reset, email change. Use when working with auth features, session management, or user identity.
---

# Authentication (Better Auth)

## Methodology - ALWAYS FOLLOW

Before implementing any auth changes:

### Step 1: Ask Clarifying Questions
- What authentication method (email/password, OAuth)?
- Are there session requirements (duration, revocation)?
- Does this involve email verification?
- What about password reset flow?
- Are there CAPTCHA requirements?

### Step 2: Enter Plan Mode
Use `EnterPlanMode` to create a detailed implementation plan:
- Review Better Auth configuration
- Check existing auth patterns
- Plan security implications
- Consider session management
- Document user flows

### Step 3: Deep Analysis (Extended Thinking)
Think deeply about:
- Security best practices
- Session token handling
- OAuth callback flows
- Email verification requirements
- Brute force protection

### Step 4: Get User Approval
Present the plan and wait for explicit approval before any implementation.

---

## Key Files

| Component | Location |
|-----------|----------|
| Server Config | `src/server/better-auth/config.ts` |
| WebSocket Config | `src/server/better-auth/config-ws.ts` |
| Auth Client | `src/lib/auth-client.ts` |
| API Route | `src/app/api/auth/[...all]/route.ts` |
| Session Parser | `src/lib/session-parser.ts` |
| Session UI | `src/app/(public)/settings/_components/SessionManagement.tsx` |

---

## Supported Auth Methods

### Email/Password
- Registration with email verification
- Password strength requirements
- Password reset via email

### Google OAuth
- One-click sign in
- Account linking

### Security Features
- Cloudflare Turnstile CAPTCHA
- Rate limiting via Arcjet
- Session tracking (IP, User Agent)

---

## Client Usage

### Auth Client Setup
```typescript
import { authClient } from "@/lib/auth-client";

// Sign up
await authClient.signUp.email({
  email: "user@example.com",
  password: "securepassword",
  name: "John Doe",
});

// Sign in
await authClient.signIn.email({
  email: "user@example.com",
  password: "securepassword",
});

// Sign out
await authClient.signOut();

// Get session
const session = await authClient.getSession();
```

### React Hooks
```typescript
import { useSession } from "@/lib/auth-client";

function Component() {
  const { data: session, isPending } = useSession();

  if (isPending) return <Loading />;
  if (!session) return <LoginPrompt />;

  return <div>Welcome, {session.user.name}</div>;
}
```

---

## Server-Side Auth

### In oRPC Handlers (Protected)
```typescript
// Use protectedProcedure - session guaranteed
protectedProcedure.handler(async ({ context }) => {
  const userId = context.session.user.id;
  const email = context.session.user.email;
  // ...
});
```

### In API Routes
```typescript
import { auth } from "@/server/better-auth/config";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ...
}
```

### In Server Components
```typescript
import { auth } from "@/server/better-auth/config";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // ...
}
```

---

## Session Management

### Session Table Fields
```typescript
{
  id: string,
  userId: string,
  token: string,
  expiresAt: Date,
  ipAddress: string | null,
  userAgent: string | null,
  createdAt: Date,
}
```

### Session Features
- View all active sessions
- Device/browser detection
- Revoke specific sessions
- Logout everywhere

### Session Parser
```typescript
import { parseSession } from "@/lib/session-parser";

const deviceInfo = parseSession(userAgent);
// Returns: { browser, os, device (mobile/tablet/desktop) }
```

---

## Password Reset Flow

```
1. User requests reset → Email sent
2. User clicks link → Token validated
3. User enters new password → Password updated
4. All sessions invalidated
```

### Client
```typescript
// Request reset
await authClient.forgetPassword({
  email: "user@example.com",
  redirectTo: "/reset-password",
});

// Reset password (from email link)
await authClient.resetPassword({
  token: tokenFromUrl,
  newPassword: "newSecurePassword",
});
```

---

## OAuth Configuration

### Google OAuth
```typescript
// In config.ts
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
},
```

### Client Usage
```typescript
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
});
```

---

## Environment Variables

```bash
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
CLOUDFLARE_TURNSTYLE_SK=xxx
NEXT_PUBLIC_CLOUDFLARE_TURNSTYLE_PK=xxx
```

---

## Database Tables (Auth)

| Table | Purpose |
|-------|---------|
| user | User accounts |
| session | Active sessions |
| account | OAuth accounts |
| verification | Email/password verification tokens |

---

## Security Checklist

- [ ] Never log passwords or tokens
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Require CAPTCHA on public forms
- [ ] Hash passwords (automatic with Better Auth)
- [ ] Set appropriate session expiry
- [ ] Enable session revocation
- [ ] Validate email on registration

---

## Auth Routes

| Route | Purpose |
|-------|---------|
| `/login` | Sign in page |
| `/signup` | Registration page |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset form |
| `/api/auth/*` | Better Auth API endpoints |
