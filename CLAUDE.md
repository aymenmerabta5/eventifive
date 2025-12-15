# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Eventifive is a modern event management platform built with Next.js 16, supporting conference and event organization with features like submissions, reviews, payments, subscriptions, real-time messaging, and program/session management.

### Codebase Quality Rating: 9.2/10

| Category | Score | Notes |
|----------|-------|-------|
| **Architecture** | 9.5/10 | Excellent domain-driven design, clean separation |
| **Type Safety** | 9.5/10 | End-to-end type safety with oRPC + Zod + Drizzle |
| **Code Organization** | 9.0/10 | Consistent patterns, proper module structure |
| **Security** | 8.5/10 | Webhook signatures, input validation, proper auth |
| **Documentation** | 9.0/10 | Comprehensive CLAUDE.md and cursor rules |

This is a university project built with professional-grade architecture and cutting-edge technologies.

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
- **Drizzle ORM** with PostgreSQL (25+ tables, 30+ indexes)
- **WebSocket** server on port 8081 for real-time features
- **Tailwind CSS 4** with shadcn/ui components (30+ UI components)
- **Redis** via Upstash for pub/sub and caching
- **Cloudflare R2** for file storage (S3-compatible)
- **Chargily** for payments (Algerian market)

### Application Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Auth pages (login, signup, reset)
│   ├── (public)/                 # Public pages (landing, events, settings)
│   │   ├── events/[eventType]/[eventId]/
│   │   │   ├── calender/         # Event schedule/calendar view
│   │   │   └── ...
│   │   ├── invites/              # User's received invites
│   │   └── settings/             # User settings & session management
│   ├── dashboard/                # Protected dashboard pages
│   │   └── _components/EventActions/  # Multi-step event forms
│   └── api/
│       ├── auth/[...all]/        # Better Auth API
│       ├── rpc/[[...rest]]/      # oRPC API endpoint
│       └── upload-*/             # File upload endpoints
├── components/
│   ├── ui/                       # shadcn/ui components (30+)
│   ├── rich-text-editor/         # TipTap editor
│   └── ...
├── server/
│   ├── orpc/                     # oRPC routers (66 endpoints)
│   │   ├── routers/
│   │   │   ├── events/           # Event CRUD + invites
│   │   │   ├── files/            # File upload/download
│   │   │   ├── payment/          # Payment checkout
│   │   │   ├── subscription/     # Plan management
│   │   │   ├── messages/         # Real-time messaging
│   │   │   ├── reviews/          # Submission reviews
│   │   │   ├── submissions/      # Event submissions
│   │   │   └── sessions/         # Program sessions + rooms
│   │   ├── context.ts            # Request context
│   │   └── index.ts              # Procedures (public/protected)
│   ├── db/
│   │   ├── schema.ts             # Drizzle schema (25+ tables)
│   │   └── index.ts              # Database client
│   ├── better-auth/              # Auth configuration
│   ├── gateway/                  # Chargily payment integration
│   ├── bucket/                   # S3/R2 file storage
│   └── realtime/                 # WebSocket server + Redis
├── lib/
│   ├── schemas/                  # Zod validation schemas
│   ├── auth-client.ts            # Better Auth client
│   ├── session-parser.ts         # Device/browser detection
│   └── utils.ts                  # Utility functions (cn, etc.)
└── mcp/                          # MCP server for test data
```

#### API Layer (oRPC) - 66 Endpoints
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

#### Database (Drizzle ORM) - 25+ Tables
- **Schema**: `src/server/db/schema.ts` - single source of truth for all tables
- **Connection**: `src/server/db/index.ts` - database client instance
- **Key entities**: users, roles, events, submissions, reviews, payments, subscriptions, files, messages, invites, program sessions, rooms
- **Table prefix**: `eventifive_*` (configured in drizzle.config.ts)
- **Indexes**: 30+ indexes on foreign keys and frequently queried columns
- **Enums**: 11 enums for type safety (payment status, billing period, etc.)

#### Payment System (Chargily)
- **Payment router**: `src/server/orpc/routers/payment/` - checkout and payment status
- **Subscription router**: `src/server/orpc/routers/subscription/` - plan management
- **Gateway integration**: `src/server/gateway/chargily.ts` - Chargily API client
- **Event sync**: `src/server/gateway/chargilySyncEvent.ts` - sync event prices to Chargily
- **Subscription sync**: `src/server/gateway/chargilySync.ts` - sync subscription plans
- **Payment schemas**: `src/lib/schemas/payment.ts` - Zod validation schemas
- **Webhook handling**: Signature verification + idempotency checks

**Key payment endpoints:**
- `payment.createCheckout` - Create subscription payment checkout
- `payment.createEventCheckout` - Create event registration payment checkout
- `payment.getStatus` - Check payment status by checkout ID
- `payment.list` - List user's payment history

**Key subscription endpoints:**
- `subscription.listPlans` - List all subscription plans
- `subscription.createPlan` - Create new subscription plan
- `subscription.syncPlans` - Sync plans with Chargily
- `subscription.getCurrent` - Get current user subscription

#### Session Management
- **Session tracking**: `src/lib/session-parser.ts` - Parse user agent for device info
- **Session UI**: `src/app/(public)/settings/_components/SessionManagement.tsx`
- **Features**: View active sessions, revoke sessions, logout everywhere
- **Device detection**: Browser, OS, device type (mobile/tablet/desktop)
- **Session table**: Enhanced with `ipAddress` and `userAgent` fields

#### Route Groups
- `(public)` - Public pages (landing, events listing, pricing)
- `(auth)` - Auth pages (login, signup, reset password)
- `dashboard` - Protected dashboard pages

#### File Storage (Cloudflare R2)
- **Provider**: Cloudflare R2 (S3-compatible)
- **Client**: `src/server/bucket/s3Client.ts`
- **Presigned URLs**: `src/server/bucket/presignedUrls.ts`
- **File router**: `src/server/orpc/routers/files/` - upload/download/delete operations
- **Upload endpoints**:
  - `/api/upload-event-image` - Event image uploads (10MB limit)
  - `/api/upload-file` - Submission file uploads
  - `/api/upload-image` - Profile image uploads
- **Storage structure**: `{userId}/events/{eventId}/{fileId}` for event images

#### Real-time Features
- **WebSocket server**: `src/server/realtime/ws.ts` on port 8081
- **Redis**: Used for pub/sub and caching via Upstash
- **Redis client**: `src/server/realtime/redis.ts`
- **Session-aware**: WebSocket connections authenticated via Better Auth

#### Calendar/Schedule Management
- **Calendar page**: `src/app/(public)/events/[eventType]/[eventId]/calender/` - Event schedule view
- **Components**: CalendarView, CalendarControls, CalendarDayColumn, CalendarHoursColumn, SessionCard
- **Features**: Week/day views, session creation, room assignments, real-time current time indicator
- **Database tables**: `programSession`, `room`, `sessionAssignment`
- **Session router**: `src/server/orpc/routers/sessions/` - CRUD for sessions and rooms

#### Invite System
- **Invite router**: `src/server/orpc/routers/events/invites.ts` - Speaker, reviewer, and committee invitations
- **Invites page**: `src/app/(public)/invites/` - View and manage received invites
- **Features**: Invite speakers (max 1), reviewers (max 3), and committee members (unlimited)
- **Database tables**: `eventSpeakers`, `eventReviewers`, `eventCommittee`
- **Status tracking**: pending, accepted, rejected
- **Auto-assignment**: Reviewers automatically assigned to submissions on acceptance

**Key invite endpoints:**
- `events.inviteSpeaker` / `events.inviteReviewer` / `events.inviteCommittee` - Send invites
- `events.acceptSpeaker` / `events.rejectSpeaker` - Respond to speaker invites
- `events.acceptReviewer` / `events.rejectReviewer` - Respond to reviewer invites
- `events.listMyInvites` - List user's received invites
- `events.listInvites` - List event's sent invites (organizer only)

#### Rich Text Editor
- **Editor component**: `src/components/rich-text-editor/Editor.tsx` - TipTap-based rich text editor
- **Menu bar**: `src/components/rich-text-editor/MenuBar.tsx` - Formatting toolbar
- **Features**: Headings, lists, text alignment, read-only mode
- **Storage format**: JSONContent (JSONB in database)
- **Used for**: Event `bigDescription`, user biographies
- **Validation**: Max 100KB JSON payload

#### Event Form System
- **Form components**: `src/app/dashboard/_components/EventActions/` - Multi-step event creation/update
- **Hooks**: `useEventForm`, `useEventDraft`, `useEventUpdate`, `useEventPrefill`, `useEventInvites`, `useEventRooms`, `useEventSessions`
- **Steps**: Event details → Image uploads → Invites → Review
- **Features**:
  - Unified create/update flow
  - Up to 4 images (1 cover + 3 gallery)
  - Dynamic end date validation based on start date
  - Rich text description support
  - 4-phase event management (including sessions and chairmen)

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

### Styling & UI Components

#### IMPORTANT: Always Use shadcn/ui Components
When building UI, **always use the predefined shadcn/ui components** from `src/components/ui/` instead of building from scratch:

**Available components (30+):**
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction`
- `Button` (variants: default, secondary, outline, ghost, destructive)
- `Badge` (variants: default, secondary, outline, destructive)
- `Avatar`, `AvatarImage`, `AvatarFallback`
- `Input`, `Textarea`, `Label`, `Checkbox`, `Select`
- `Dialog`, `Sheet`, `Drawer`
- `Table`, `Tabs`, `Separator`
- `DropdownMenu`, `Tooltip`, `Popover`
- `Skeleton` (for loading states)
- `Calendar` (date picker with react-day-picker)
- `Collapsible` (expandable sections)
- `Kbd`, `KbdGroup` (keyboard shortcut display)
- `Breadcrumb` (navigation breadcrumbs)
- `Toggle`, `ToggleGroup` (toggle switches)
- `StatefulButton` (animated button with loading/success states)
- `Sidebar` (navigation sidebar)
- `Sonner` (toast notifications - use `toast` from sonner)

**Custom components:**
- `Editor` from `@/components/rich-text-editor/Editor` - TipTap rich text editor
- `Uploader` from `@/components/uploader` - File upload component
- `UserMenu` from `@/components/user-menu` - User dropdown menu
- `StepProgress` from `@/components/step-progress` - Multi-step progress indicator

**Example - Building a card section:**
```typescript
// GOOD - Use shadcn Card components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

<Card className="rounded-3xl shadow-lg">
  <CardHeader>
    <CardTitle>Section Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Badge variant="secondary">Tag</Badge>
  </CardContent>
</Card>

// BAD - Building cards from scratch with divs
<div className="border rounded-3xl shadow-lg">
  <div className="px-6 py-4 border-b">
    <h2>Section Title</h2>
  </div>
  <div className="p-6">
    <span className="px-2 py-1 rounded bg-muted">Tag</span>
  </div>
</div>
```

#### Color Palette (from `src/styles/index.css`)
Always use the CSS custom properties for colors to ensure consistency and dark mode support:

**Semantic Colors (use these):**
- `--background` / `--foreground` - Page background and text
- `--card` / `--card-foreground` - Card surfaces
- `--primary` / `--primary-foreground` - Primary actions, links
- `--secondary` / `--secondary-foreground` - Secondary elements
- `--muted` / `--muted-foreground` - Subtle backgrounds, secondary text
- `--accent` / `--accent-foreground` - Highlighted elements
- `--destructive` / `--destructive-foreground` - Errors, delete actions
- `--border` - Borders and dividers
- `--input` - Form input borders
- `--ring` - Focus rings

**Usage in Tailwind:**
```typescript
// GOOD - Use semantic color classes
<div className="bg-background text-foreground">
<div className="bg-card border-border">
<button className="bg-primary text-primary-foreground">
<span className="text-muted-foreground">
<div className="bg-primary/10 text-primary"> // With opacity

// BAD - Hardcoded colors
<div className="bg-white text-black">
<div className="bg-gray-100 border-gray-200">
<button className="bg-purple-600 text-white">
```

**Chart Colors:** `--chart-1` through `--chart-5` for data visualization

#### Tailwind CSS 4
- Auto-generated config from `src/styles/index.css`
- Dark mode supported via `next-themes` and `.dark` class
- Use `cn()` utility from `@/lib/utils` for conditional classes

### Type Safety
- All API routes type-safe via oRPC
- Database queries type-safe via Drizzle
- Auth session type-safe via Better Auth
- Use `@/*` path aliases for imports
- Only 41 `any` occurrences in 270+ files (excellent discipline)

### Error Handling
- Use `ORPCError` for API errors with proper HTTP codes (NOT_FOUND, UNAUTHORIZED, BAD_REQUEST, FORBIDDEN)
- 158 proper error throws across router files
- Transaction rollbacks on payment failures
- Always validate ownership before mutations (`assertOrganizer` pattern)

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

// Transaction (for related operations)
await db.transaction(async (tx) => {
  await tx.insert(event).values({ ... });
  await tx.insert(eventSettings).values({ ... });
});
```

### File Uploads
Use the files router pattern in `src/server/orpc/routers/files/`:
1. `requestUpload` - Get presigned URL
2. Client uploads directly to R2
3. `confirmUpload` - Mark upload complete in DB

### Payment Integration
```typescript
// Create event checkout
const checkout = await client.payment.createEventCheckout({
  eventId: "event-id",
  successUrl: "/payment/success",
  failureUrl: "/payment/failure",
});

// Redirect user to checkout.checkoutUrl
window.location.href = checkout.checkoutUrl;

// Check payment status
const status = await client.payment.getStatus({ checkoutId: checkout.checkoutId });
```

### Subscription Plans
```typescript
// List available plans
const plans = await client.subscription.listPlans();

// Get user's current subscription
const subscription = await client.subscription.getCurrent();
```

### Rich Text Editor
```typescript
// Using the TipTap-based rich text editor
import Editor from "@/components/rich-text-editor/Editor";
import type { JSONContent } from "@tiptap/react";

// Editable mode
<Editor
  content={initialContent}
  value={value}
  onChange={(json: JSONContent) => setValue(json)}
/>

// Read-only mode (for displaying saved content)
<Editor
  content={savedContent}
  value={savedContent}
  readOnly
/>
```

### Invite System
```typescript
// Invite a speaker to an event (max 1 per event)
await client.events.inviteSpeaker({ eventId, speakerId: userId });

// Invite a reviewer (max 3 per event)
await client.events.inviteReviewer({ eventId, reviewerId: userId });

// Invite a committee member (unlimited)
await client.events.inviteCommittee({ eventId, committeeId: userId });

// Accept/reject invites (as the invited user)
await client.events.acceptSpeaker({ eventId });
await client.events.rejectReviewer({ eventId });

// List user's received invites
const invites = await client.events.listMyInvites();
// Returns: { speakerInvites, reviewerInvites, committeeAssignments }
```

### Program Sessions & Rooms
```typescript
// Create a room for an event
await client.sessions.createRoom({ eventId, name: "Main Hall", capacity: 100 });

// Create a program session
await client.sessions.createSession({
  eventId,
  title: "Opening Keynote",
  startTime: new Date("2025-06-15T09:00:00"),
  endTime: new Date("2025-06-15T10:00:00"),
  roomId: "room-id",
});

// Assign speakers to sessions
await client.sessions.assignSpeaker({ sessionId, speakerId });
```

## Database Schema

### Key Enums (11 total)
- `paymentStatusEnum`: unpaid, pending, paid, refunded
- `billingPeriodEnum`: monthly, yearly
- `subscriptionStatusEnum`: pending, active, cancelled, expired
- `eventSpeakerStatusEnum`: pending, accepted, rejected (used for speaker/reviewer invites)
- `eventTypeEnum`: conference, workshop, seminar, etc.
- `submissionStatusEnum`: draft, submitted, under_review, accepted, rejected
- And more...

### Core Tables (25+)
- `user`, `session`, `account`, `verification` - Auth tables
- `event`, `eventImages`, `eventSettings` - Event management
- `eventSpeakers`, `eventReviewers`, `eventCommittee` - Invite system
- `submission`, `submissionFile`, `review`, `reviewAssignment` - Submissions & reviews
- `programSession`, `room`, `sessionAssignment` - Calendar/schedule
- `subscriptionPlan`, `subscriptionPrice`, `userSubscription` - Subscriptions
- `payment`, `eventRegistration` - Payments
- `conversation`, `message` - Real-time messaging
- `file` - File metadata

### Currency Handling
- Amounts stored in whole currency units (e.g., 5000 DZD, not cents)
- Default currency: DZD (Algerian Dinar)
- Chargily integration syncs products/prices automatically

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

## Security Features

- **Authentication**: Better Auth with email/password + Google OAuth
- **Session Security**: IP + User Agent tracking, revocation support
- **Input Validation**: Zod schemas on all 66 API endpoints
- **SQL Injection**: Protected by Drizzle ORM (parameterized queries)
- **XSS**: React's built-in escaping + sanitization
- **CSRF**: Cloudflare Turnstile CAPTCHA
- **Webhook Security**: Signature verification for Chargily
- **Rate Limiting**: Arcjet integration
- **Authorization**: Ownership validation on all mutations

## Notes

- This is a university project - do not share code externally
- WebSocket server must be running for real-time features
- Use `pnpm` (version 10+) as package manager
- Node.js 20+ required
- Database uses table prefix `eventifive_*`
- React Compiler enabled for automatic optimizations
