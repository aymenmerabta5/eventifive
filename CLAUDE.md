# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Eventifive is a modern event management platform built with Next.js 16, supporting conference and event organization with features like submissions, reviews, payments, and real-time messaging.

## Development Commands

### Basic Commands
- `pnpm dev` - Start development server (runs both Next.js with Turbopack and WebSocket server on ports 3000 and 8081)
- `pnpm build` - Build for production
- `pnpm start` - Start production server (runs both Next.js and WebSocket server)
- `pnpm preview` - Build and start production server locally

### Code Quality
- `pnpm check` - Run both ESLint and TypeScript type checking (preferred for comprehensive checks)
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Auto-fix ESLint errors
- `pnpm typecheck` - Run TypeScript type checking only
- `pnpm format:check` - Check code formatting with Prettier
- `pnpm format:write` - Format code with Prettier

### Database Commands
- `pnpm db:push` - Push schema changes directly to database (quick, for development)
- `pnpm db:generate` - Generate migration files from schema
- `pnpm db:migrate` - Run pending migrations
- `pnpm db:studio` - Open Drizzle Studio GUI at https://local.drizzle.studio
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:reset` - Reset database (warning: destructive)

### Standalone Scripts
- `pnpm ws` - Run WebSocket server independently (normally runs automatically with dev/start)

## Architecture

### Tech Stack Core
- **Next.js 16** with App Router, React 19, Turbopack, React Compiler
- **TypeScript** with strict mode and path aliases (`@/*` → `src/*`)
- **oRPC** - Type-safe API layer (no tRPC, replace with oRPC patterns)
- **Better Auth** - Authentication (no NextAuth, use Better Auth patterns)
- **Drizzle ORM** with PostgreSQL
- **WebSocket** server on port 8081 for real-time features
- **Tailwind CSS 4** with shadcn/ui components

### Application Structure

#### API Layer (oRPC)
- **Router definition**: `src/server/orpc/routers/index.ts` exports `appRouter` composed of feature routers
- **Context**: `src/server/orpc/context.ts` provides session and request context
- **Procedures**:
  - `publicProcedure` - No auth required
  - `protectedProcedure` - Requires authenticated session
- **API endpoint**: `src/app/api/rpc/[[...rest]]/route.ts` handles both RPC calls and OpenAPI docs
- **Client usage**: Import `appRouter` type for type-safe client calls with `@orpc/client`
- **WebSocket RPC**: Separate handler in `src/server/realtime/ws.ts` on port 8081

#### Authentication (Better Auth)
- **Server config**: `src/server/better-auth/config.ts` - main auth instance
- **WebSocket config**: `src/server/better-auth/config-ws.ts` - separate instance for WS
- **Client**: `src/lib/auth-client.ts` - React client with `createAuthClient`
- **API route**: `src/app/api/auth/[...all]/route.ts`
- **Features**: Email/password, Google OAuth, password reset, email change, Cloudflare Turnstile

#### Database (Drizzle ORM)
- **Schema**: `src/server/db/schema.ts` - single source of truth for all tables
- **Connection**: `src/server/db/index.ts` - database client instance
- **Key entities**: users, roles, events, submissions, reviews, payments, files, messages
- **Table prefix**: `eventifive_*` (configured in drizzle.config.ts)

#### Route Groups
- `(public)` - Public pages (landing, events listing, pricing)
- `(auth)` - Auth pages (login, signup, reset password)
- `dashboard` - Protected dashboard pages

#### File Storage
- **Provider**: Cloudflare R2 (S3-compatible)
- **Client**: `src/server/bucket/s3Client.ts`
- **Presigned URLs**: `src/server/bucket/presignedUrls.ts`
- **File router**: `src/server/orpc/routers/files/` - upload/download/delete operations

#### Real-time Features
- **WebSocket server**: `src/server/realtime/ws.ts` on port 8081
- **Redis**: Used for pub/sub and caching via Upstash
- **Redis client**: `src/server/realtime/redis.ts`

### Environment Variables

Required variables (see `.env` for full list):
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Auth secret (production)
- `BETTER_AUTH_URL` - Auth callback URL
- `RESEND_API_KEY` / `RESEND_SENDER_EMAIL` - Email service
- `CLOUDFLARE_TURNSTYLE_SK` / `NEXT_PUBLIC_CLOUDFLARE_TURNSTYLE_PK` - Captcha
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth
- `S3_ENDPOINT` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `S3_BUCKET_NAME` - R2 storage
- `CHARGILY_SK` / `NEXT_PUBLIC_CHARGILY_PK` - Payment gateway (optional in dev)
- `REDIS_REST_URL` / `REDIS_REST_TOKEN` - Redis connection
- `ARCJET_API` - Security/rate limiting
- `NEXT_PUBLIC_WEBSOCKET_URL` - WebSocket server URL (default: ws://localhost:8081)

Environment validation is handled by `@t3-oss/env-nextjs` in `src/env.ts`.

## Development Guidelines

### Adding New API Routes (oRPC)
1. Create router in `src/server/orpc/routers/` (e.g., `myFeatureRouter.ts`)
2. Use `publicProcedure` or `protectedProcedure` from `src/server/orpc/index.ts`
3. Define with `.route({ method, path })`, `.input(schema)`, `.output(schema)`, `.handler()`
4. Export and add to `appRouter` in `src/server/orpc/routers/index.ts`
5. Type-safe client calls automatically available via `AppRouter` type

### Database Schema Changes
1. Edit `src/server/db/schema.ts`
2. Run `pnpm db:push` for quick dev iteration (recommended)
3. For production migrations: `pnpm db:generate` then `pnpm db:migrate`

### Authentication Checks
- Server-side: Use `protectedProcedure` for authenticated endpoints
- Pages: Call `auth.api.getSession()` server-side or use `authClient` hooks client-side
- Context: Session available in `context.session` in all procedure handlers

### WebSocket Integration
- WebSocket server runs concurrently with Next.js (started by `pnpm dev`)
- Uses same oRPC routers with `RPCHandler` from `@orpc/server/ws`
- Session authentication handled via Better Auth headers
- Client connects to `NEXT_PUBLIC_WEBSOCKET_URL`

### Styling
- Tailwind CSS 4 auto-generated config
- UI components in `src/components/ui/` follow shadcn/ui patterns
- Dark mode supported via `next-themes`

### Type Safety
- All API routes type-safe via oRPC
- Database queries type-safe via Drizzle
- Auth session type-safe via Better Auth
- Use `@/*` path aliases for imports

## Common Patterns

### Creating a Protected Route
```typescript
import { protectedProcedure } from "../index";
import { z } from "zod";

export const myRouter = protectedProcedure
  .route({ method: "POST", path: "/my-feature" })
  .input(z.object({ data: z.string() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    // Implementation
    return { success: true };
  });
```

### Database Queries
```typescript
import { db } from "@/server/db";
import { event } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// Insert
await db.insert(event).values({ ... });

// Query
const events = await db.select().from(event).where(eq(event.organizerId, userId));

// Update
await db.update(event).set({ ... }).where(eq(event.id, eventId));
```

### File Uploads
Use the files router pattern in `src/server/orpc/routers/files/`:
1. `requestUpload` - Get presigned URL
2. Client uploads directly to R2
3. `confirmUpload` - Mark upload complete in DB

## MCP Server (Test Data Generation)

The project includes an MCP (Model Context Protocol) server for generating test data via AI assistants like Claude/Cursor.

### Location
`src/mcp/` - Standalone TypeScript package with its own dependencies

### MCP Commands
```bash
cd src/mcp
pnpm install        # Install MCP dependencies
pnpm build          # Compile TypeScript to dist/
pnpm dev            # Watch mode for development
```

### Available Tools

| Tool | Description |
|------|-------------|
| `create_user` | Create a test user with email/password auth |
| `create_users_bulk` | Create multiple users at once |
| `list_users` | List all users in the database |
| `create_event` | Create an event with organizer |
| `list_events` | List all events |
| `get_event` | Get event details by ID |
| `create_submission` | Create a submission for an event |
| `create_submissions_bulk` | Create multiple submissions |
| `list_submissions` | List submissions for an event |
| `create_review` | Create a review for a submission |
| `create_reviews_for_event` | Create reviews for all event submissions |
| `list_reviews` | List reviews for a submission |
| `seed_complete_event` | Create complete test scenario (users, event, submissions, reviews) |
| `quick_seed` | Create minimal test data (1 user, 1 event, 1 submission) |

### Cursor/Claude Desktop Integration

Add to your MCP config (e.g., `~/.cursor/mcp.json` or Claude Desktop config):
```json
{
  "mcpServers": {
    "eventifive": {
      "command": "node",
      "args": ["path/to/eventifive/src/mcp/dist/index.js"],
      "env": {
        "DATABASE_URL": "your-postgresql-connection-string"
      }
    }
  }
}
```

### MCP Architecture
```
src/mcp/
├── src/
│   ├── index.ts           # MCP server entry point (stdio transport)
│   ├── db.ts              # Database connection
│   ├── schema.ts          # Local copy of Drizzle schema
│   ├── utils/
│   │   └── password.ts    # Password hashing utility
│   └── tools/
│       ├── users.ts       # User creation tools
│       ├── events.ts      # Event creation tools
│       ├── submissions.ts # Submission creation tools
│       ├── reviews.ts     # Review creation tools
│       └── seed.ts        # Bulk seeding tools
├── dist/                  # Compiled output (gitignored)
├── package.json
└── tsconfig.json
```

### Key Dependencies
- `@modelcontextprotocol/sdk` - MCP TypeScript SDK
- `drizzle-orm` + `postgres` - Database access
- `@faker-js/faker` - Realistic test data generation
- `zod` v4 - Input validation

## Notes

- This is a proprietary project - do not share code externally
- WebSocket server must be running for real-time features
- Use `pnpm` (version 10+) as package manager
- Node.js 20+ required
- Database uses table prefix `eventifive_*`
