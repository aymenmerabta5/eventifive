# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Eventifive** is a modern event management platform built with Next.js 16, supporting conference and event organization with features like submissions, reviews, payments, subscriptions, real-time messaging, program/session management, certificates, and session Q&A.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun (package manager + runtime via `--bun` flag) |
| Framework | Next.js 16 (App Router, React 19, Turbopack, React Compiler) |
| Language | TypeScript (strict mode, `@/*` path aliases) |
| API | oRPC (type-safe, 80+ endpoints) |
| Auth | Better Auth (email/password, Google OAuth) |
| Database | Drizzle ORM + Bun SQL (native PostgreSQL, 30+ tables) |
| Realtime | Bun native WebSocket (port 8081) + Redis/ioredis (Upstash) |
| UI | Tailwind CSS 4 + shadcn/ui (30+ components) |
| Storage | Cloudflare R2 via Bun S3Client (native) |
| Payments | Chargily (Algerian market) |
| Caching | Redis via ioredis (dashboard stats, presence) |

## Development Commands

```bash
# Development
bun run dev           # Start dev server (Next.js + WebSocket on 3000/8081)
bun run build         # Production build
bun run preview       # Build and start locally

# Code Quality
# To see errors i want you to use LSP server of typescript dont do typecheck or check
bun run check         # ESLint + TypeScript 
bun run lint:fix      # Auto-fix ESLint
bun run typecheck     # TypeScript only
bun run format:write  # Prettier format

# Database
bun run db:push       # Push schema to DB (dev)
bun run db:generate   # Generate migrations
bun run db:migrate    # Run migrations
bun run db:studio     # Drizzle Studio GUI
bun run db:seed       # Seed sample data
bun run db:init       # Reset, Generate, Push, Seed the Database

# WebSocket (standalone)
bun run ws            # Start WebSocket server only

# MCP (runs directly, no build needed)
bun src/mcp/src/index.ts
```

## Application Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, signup)
│   ├── (public)/                 # Public pages (events, settings, sessions, registrations, certificates)
│   ├── dashboard/                # Protected dashboard (organizer + admin views)
│   ├── messages/                 # Real-time messaging with presence
│   └── api/                      # API routes (auth, rpc, uploads, webhooks)
├── components/
│   ├── ui/                       # shadcn/ui components
│   └── rich-text-editor/         # TipTap editor
├── server/
│   ├── orpc/routers/             # API routers by domain (12 routers)
│   ├── db/                       # Drizzle schema & Bun SQL client
│   ├── better-auth/              # Auth configuration
│   ├── gateway/                  # Chargily integration
│   ├── bucket/                   # R2 file storage (Bun S3Client)
│   ├── cache/                    # Redis caching layer
│   └── realtime/                 # Bun WebSocket + Redis (presence, Q&A)
├── lib/
│   ├── schemas/                  # Zod validation
│   ├── certificates/             # Certificate generation (template, QR code)
│   ├── emails/                   # Email templates (React Email)
│   └── utils.ts                  # Utility functions
├── scripts/                      # Bun parallel execution scripts
│   ├── dev.ts                    # Development server launcher
│   └── start.ts                  # Production server launcher
└── mcp/                          # Test data MCP server
```

## Key File Locations

| Domain | Location |
|--------|----------|
| Database Schema | `src/server/db/schema.ts` |
| Database Client | `src/server/db/index.ts` (Bun SQL) |
| S3 Client | `src/server/bucket/s3Client.ts` (Bun S3Client) |
| WebSocket Server | `src/server/realtime/ws.ts` (Bun native) |
| API Routers | `src/server/orpc/routers/` |
| Procedures | `src/server/orpc/index.ts` (public, protected, admin) |
| Auth Config | `src/server/better-auth/config.ts` |
| Zod Schemas | `src/lib/schemas/` |
| UI Components | `src/components/ui/` |
| Environment | `src/env.ts` (validation via @t3-oss/env-nextjs) |
| Cache Layer | `src/server/cache/` (Redis caching + invalidation) |
| Presence System | `src/server/realtime/presence.ts` |
| Session Q&A | `src/server/realtime/session-qa.ts` |
| Certificates | `src/lib/certificates/` (template, QR, verification) |

## API Routers (12 domains)

| Router | Endpoints | Description |
|--------|-----------|-------------|
| admin | 1 | Super admin dashboard stats |
| organizer | 2 | Organizer dashboard stats + charts |
| events | 12+ | Event CRUD, invites, registrations, myEvents, myRegistrations |
| profile | 3 | User profile management |
| files | 5 | Upload/download with presigned URLs |
| payment | 4 | Chargily checkout integration |
| subscription | 4 | Plan management |
| messages | 8 | Real-time messaging + presence |
| qa | 7 | Session Q&A (ask, like, answer, approve, subscribe) |
| submissions | 2+ | Event submissions |
| reviews | 1+ | Submission reviews |
| sessions | 10 | Program sessions, rooms, mySessions |
| certificates | 7 | Generate, download, verify, revoke |

## Procedure Types

```typescript
// src/server/orpc/index.ts
export const publicProcedure = o;                    // No auth required
export const protectedProcedure = publicProcedure.use(requireAuth);  // Requires login
export const adminProcedure = protectedProcedure.use(requireAdmin);  // Requires super_admin role
```

## Bun Native APIs Used

### Database (Bun SQL)
```typescript
import { drizzle } from "drizzle-orm/bun-sql";
import { SQL } from "bun";

const client = new SQL(env.DATABASE_URL);
export const db = drizzle({ client, schema });
```

### S3 Storage (Bun S3Client)
```typescript
import { S3Client } from "bun";

export const s3Client = new S3Client({
  bucket: env.S3_BUCKET_NAME,
  endpoint: env.NEXT_PUBLIC_S3_ENDPOINT,
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
});

// Usage
await s3Client.write(key, buffer, { type: contentType });
await s3Client.delete(key);
const url = s3Client.presign(key, { expiresIn: 3600 });
const exists = await s3Client.exists(key);
```

### WebSocket (Bun native)
```typescript
Bun.serve({
  port: 8081,
  websocket: {
    open(ws) { /* ... */ },
    message(ws, data) { /* ... */ },
    close(ws) { /* ... */ },
  },
});
```

## Environment Variables

Required (see `.env` for full list):
- `DATABASE_URL` - PostgreSQL connection
- `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` - Auth
- `S3_*` / `AWS_*` - R2 storage
- `CHARGILY_SK` - Payments
- `REDIS_URL` - Redis (native connection for pub/sub)

## Security Highlights

- Zod validation on all 80+ endpoints
- Drizzle ORM prevents SQL injection
- Ownership validation on mutations (`assertOrganizer` pattern)
- Role-based access control (super_admin, organizer, user)
- Cloudflare Turnstile CAPTCHA
- Webhook signature verification
- Rate limiting via Arcjet

## Key Features

### Certificates System
- Generate certificates for speakers, reviewers, committee, facilitators
- QR code verification with unique verification codes
- Email notifications on certificate issuance
- Revocation support with reason tracking

### Session Q&A (Real-time)
- Ask questions during sessions (anonymous option)
- Like/upvote questions
- Moderation support (qaModerated flag on sessions)
- Real-time subscription via WebSocket

### Presence System
- Real-time online status using Redis TTL
- Heartbeat-based presence (60s TTL)
- `lastSeenAt` tracking in database
- Used in messaging for online indicators

### Dashboard Caching
- Redis-based caching for dashboard stats
- Cache invalidation helpers
- Organizer and admin dashboard separation

### Event Lifecycle System
Events follow a managed lifecycle with explicit status transitions:

**Statuses:**
- `draft` - Initial state, invisible to public, editable
- `published` - Visible to public, accepts registrations
- `cancelled` - Visible with cancellation notice, no registrations
- `archived` - Hidden from public, historical record

**Key Rules:**
- Events start as `draft` and must be explicitly published
- Cannot publish events where `endDate < now` (past events blocked)
- Can publish ongoing events (`startDate < now < endDate`)
- Only `published` events count toward organizer quota
- Registration blocked for non-published events
- Unpublishing requires zero registrations

**Display Status (computed):**
- Draft, Published, Cancelled, Archived (from database)
- Upcoming, Live, Completed (computed from dates for published events)

**Lifecycle Endpoints:**
- `events.publish` - Publish draft event
- `events.unpublish` - Revert to draft (if 0 registrations)
- `events.cancel` - Cancel event with reason
- `events.archive` - Archive past/cancelled events

## Database Enums

```typescript
// Roles
rolesEnum: "super_admin" | "organizer" | "user"

// Certificates
certificateRoleEnum: "speaker" | "committee" | "reviewer" | "facilitator"

// Events
eventTypeEnum: "congress" | "seminar" | "workshop" | "scientific_meeting" | "conference" | "symposium"
eventStatusEnum: "draft" | "published" | "cancelled" | "archived"

// Payments
paymentStatusEnum: "unpaid" | "pending" | "paid" | "refunded"
subscriptionStatusEnum: "pending" | "active" | "cancelled" | "expired"
```

## Notes

- Use `bun` as package manager and runtime
- Next.js runs on Bun runtime via `bun --bun next dev`
- Bun loads `.env` automatically (no dotenv needed)
- WebSocket runs as separate Bun process on port 8081
- MCP server runs directly with Bun (no build step)

---

**For detailed implementation patterns, see the skills in `.claude/skills/`**
