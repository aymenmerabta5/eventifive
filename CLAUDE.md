# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
- `pnpm dev` - Start development server with WebSocket server (launches both Next.js with Turbopack and WebSocket server concurrently)
- `pnpm start` - Start production server with WebSocket server
- `pnpm build` - Build for production
- `pnpm preview` - Build and preview production locally

### Code Quality
- `pnpm check` - Run both linting and type checking (recommended before commits)
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Auto-fix ESLint errors
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm format:check` - Check code formatting with Prettier
- `pnpm format:write` - Format code with Prettier

### Database Operations
- `pnpm db:push` - Push schema changes directly to database (for development)
- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio (visual database browser)
- `pnpm db:seed` - Seed the database
- `pnpm db:reset` - Drop all database tables

### WebSocket Server
- `pnpm ws` - Run standalone WebSocket server (usually started automatically with `dev` and `start`)

## Architecture Overview

### oRPC API Layer
This project uses **oRPC** as the primary API layer, providing end-to-end type safety between client and server:

- **Router Structure**: All routers are defined in `src/server/orpc/routers/` and exported via `src/server/orpc/routers/index.ts`
- **Available Routers**: profileRouter, eventRouter, filesRouter, uploadImageRouter, getProfileImageRouter, websocketsRouter
- **Procedures**: Two types of procedures are available:
  - `publicProcedure` - No authentication required
  - `protectedProcedure` - Requires authenticated user session (throws `UNAUTHORIZED` if not authenticated)
- **HTTP Endpoint**: All HTTP RPC requests go through `/api/rpc/[[...rest]]/route.ts`
- **OpenAPI**: API reference available at `/api/rpc/api-reference` (auto-generated from routers)
- **Context**: Server context includes `session` and `req`, created in `src/server/orpc/context.ts`

### Dual Transport System (HTTP + WebSocket)
The application uses a **hybrid transport layer** via oRPC's `DynamicLink`:

- **HTTP Link**: Standard REST-like requests via Next.js API routes (`/api/rpc`)
- **WebSocket Link**: Real-time communication via standalone WebSocket server (port 8081)
- **Dynamic Routing**: Configured in `src/utils/orpc.ts`:
  - Requests to `websocketsRouter` automatically use WebSocket transport
  - All other routers use HTTP transport
- **WebSocket Server**: Standalone server in `src/server/ws.ts` that:
  - Runs on port 8081
  - Shares the same `appRouter` as HTTP
  - Handles session authentication via Better Auth
  - Configured to run concurrently with Next.js dev server

### Client-Side oRPC Integration
- **Client Setup**: `src/utils/orpc.ts` exports:
  - `client` - Type-safe oRPC client with `AppRouterClient` type
  - `orpc` - TanStack Query utilities for React hooks
  - `queryClient` - Configured with global error handling (toasts)
  - `link` - Dynamic link that routes between HTTP/WebSocket based on router
- **Usage Pattern**:
  ```typescript
  // In React components
  const { data } = orpc.profileRouter.getProfile.useQuery({ userId: "123" });

  // Direct client calls (server-side)
  const result = await client.profileRouter.getProfile({ userId: "123" });
  ```

### Authentication
Uses **Better Auth** with Drizzle adapter:

- **Config**: `src/server/better-auth/config.ts` (HTTP), `src/server/better-auth/config-ws.ts` (WebSocket)
- **Client**: `src/lib/auth-client.ts` exports `authClient` for React components
- **Features**:
  - Email/password authentication
  - Google OAuth
  - Password reset via email (Resend)
  - Cloudflare Turnstile captcha
  - Session management with auto-refresh
- **Additional User Fields**: `biography` field stored as JSON
- **Session Type**: `Session` type exported from config for type safety

### Database Schema
Uses **Drizzle ORM** with PostgreSQL:

- **Schema**: `src/server/db/schema.ts` contains all tables
- **Key Tables**:
  - `user` - Extended with institution, roleId, researchDomain, biography
  - `roles` - Role-based access control (super_admin, admin, communicator, etc.)
  - `event` - Event management (congress, seminar, workshop, etc.)
  - `files` - S3 file uploads with status tracking
  - Better Auth tables: `session`, `account`, `verification`
- **Config**: `drizzle.config.ts` with table filter `eventifive_*`
- **Connection**: Database instance exported from `src/server/db/`

### Environment Variables
Managed by **@t3-oss/env-nextjs** in `src/env.ts`:

**Required Server Variables**:
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Auth secret (production only)
- `BETTER_AUTH_URL` - Auth callback URL
- `RESEND_API_KEY`, `RESEND_SENDER_EMAIL` - Email service
- `CLOUDFLARE_TURNSTYLE_SK` - Server-side captcha
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth
- `S3_ENDPOINT`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` - S3/R2 storage
- `ARCJET_API` - Security/rate limiting

**Required Client Variables**:
- `NEXT_PUBLIC_CLOUDFLARE_TURNSTYLE_PK` - Client-side captcha
- `NEXT_PUBLIC_WEBSOCKET_URL` - WebSocket server URL

### File Storage
- **Provider**: AWS S3 or Cloudflare R2
- **Implementation**: Uses `@aws-sdk/client-s3` and `@aws-sdk/lib-storage`
- **Routers**: `uploadImageRouter` and `getProfileImageRouter` handle image operations
- **Tracking**: `files` table stores metadata with status (pending/completed/failed)

### Next.js Configuration
- **App Router**: Using Next.js 16 with App Router
- **Typed Routes**: Enabled (`typedRoutes: true`)
- **React Compiler**: Enabled for optimization (`reactCompiler: true`)
- **Turbopack**: Used in development mode
- **Route Groups**:
  - `(auth)` - Authentication pages
  - `(public)` - Public pages
  - `dashboard` - Protected dashboard area

### UI Components
- **Base**: Radix UI primitives with Tailwind CSS 4
- **Location**: `src/components/ui/`
- **Icons**: Lucide React (`lucide-react`), Tabler Icons, Simple Icons
- **Theme**: Dark mode support via `next-themes`
- **Rich Text**: TipTap editor in `src/components/rich-text-editor/`
- **Animations**: Motion library (`motion`) + `tw-animate-css`

### TypeScript Configuration
- **Strict Mode**: Enabled with `noUncheckedIndexedAccess`
- **Path Alias**: `@/*` maps to `src/*`
- **Module**: ESNext with Bundler resolution
- **JSX**: React JSX transform
- **Target**: ES2022

## Important Development Notes

### Adding New oRPC Routers
1. Create router file in `src/server/orpc/routers/`
2. Use `publicProcedure` or `protectedProcedure` from `src/server/orpc/index.ts`
3. Export router in `src/server/orpc/routers/index.ts` in `appRouter` object
4. Router will be automatically type-safe on client via `AppRouterClient`
5. For WebSocket-specific routers, place in `websockets/` subdirectory

### WebSocket Development
- WebSocket server runs on port 8081 (separate from Next.js on 3000)
- Both servers must run for full functionality (use `pnpm dev`)
- WebSocket router access: `client.websocketsRouter.method()`
- Session auth is handled automatically in WebSocket upgrade

### Database Migrations
- Prefer `pnpm db:push` during active development for quick schema changes
- Use `pnpm db:generate` + `pnpm db:migrate` for production-ready migrations
- Schema changes in `src/server/db/schema.ts` are automatically type-safe via Drizzle

### Protected Routes
- Server-side session check: Use `createContext` to get session in API routes
- Client-side: Use `authClient` from `src/lib/auth-client.ts`
- oRPC: Use `protectedProcedure` which automatically checks for authenticated session

### Email Templates
- Email templates use `@react-email` in `src/lib/emails/`
- Send via `sendEmail` function in `src/lib/sendEmail.ts`
- Configured with Resend service

## Package Manager

This project uses **pnpm 10+** as specified in `package.json`. Always use `pnpm` commands, not npm or yarn.

## Technology Stack Summary

- **Framework**: Next.js 16 (App Router), React 19
- **API Layer**: oRPC with HTTP + WebSocket transport
- **Auth**: Better Auth with Drizzle adapter
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS 4
- **State**: TanStack Query (React Query)
- **Forms**: TanStack Form
- **Email**: Resend + React Email
- **Storage**: S3/R2
- **Security**: Arcjet, Cloudflare Turnstile
