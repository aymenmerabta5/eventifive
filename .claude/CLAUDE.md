# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Eventifive** is a modern event management platform built with Next.js 16, supporting conference and event organization with features like submissions, reviews, payments, subscriptions, real-time messaging, and program/session management.

This is a university project built with professional-grade architecture and cutting-edge technologies.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun (package manager + runtime via `--bun` flag) |
| Framework | Next.js 16 (App Router, React 19, Turbopack, React Compiler) |
| Language | TypeScript (strict mode, `@/*` path aliases) |
| API | oRPC (type-safe, 66 endpoints) |
| Auth | Better Auth (email/password, Google OAuth) |
| Database | Drizzle ORM + Bun SQL (native PostgreSQL, 25+ tables) |
| Realtime | Bun native WebSocket (port 8081) + Redis/ioredis (Upstash) |
| UI | Tailwind CSS 4 + shadcn/ui (30+ components) |
| Storage | Cloudflare R2 via Bun S3Client (native) |
| Payments | Chargily (Algerian market) |

## Development Commands

```bash
# Development
bun run dev           # Start dev server (Next.js + WebSocket on 3000/8081)
bun run build         # Production build
bun run preview       # Build and start locally

# Code Quality
bun run check         # ESLint + TypeScript (preferred)
bun run lint:fix      # Auto-fix ESLint
bun run typecheck     # TypeScript only
bun run format:write  # Prettier format

# Database
bun run db:push       # Push schema to DB (dev)
bun run db:generate   # Generate migrations
bun run db:migrate    # Run migrations
bun run db:studio     # Drizzle Studio GUI
bun run db:seed       # Seed sample data

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
│   ├── (public)/                 # Public pages (events, settings)
│   ├── dashboard/                # Protected dashboard
│   └── api/                      # API routes (auth, rpc, uploads)
├── components/
│   ├── ui/                       # shadcn/ui components
│   └── rich-text-editor/         # TipTap editor
├── server/
│   ├── orpc/routers/             # API routers by domain
│   ├── db/                       # Drizzle schema & Bun SQL client
│   ├── better-auth/              # Auth configuration
│   ├── gateway/                  # Chargily integration
│   ├── bucket/                   # R2 file storage (Bun S3Client)
│   └── realtime/                 # Bun WebSocket + Redis
├── lib/
│   ├── schemas/                  # Zod validation
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
| Auth Config | `src/server/better-auth/config.ts` |
| Zod Schemas | `src/lib/schemas/` |
| UI Components | `src/components/ui/` |
| Environment | `src/env.ts` (validation via @t3-oss/env-nextjs) |

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

- Zod validation on all 66 endpoints
- Drizzle ORM prevents SQL injection
- Ownership validation on mutations (`assertOrganizer` pattern)
- Cloudflare Turnstile CAPTCHA
- Webhook signature verification
- Rate limiting via Arcjet

## Notes

- Use `bun` as package manager and runtime
- Next.js runs on Bun runtime via `bun --bun next dev`
- Bun loads `.env` automatically (no dotenv needed)
- Database table prefix: `eventifive_*`
- WebSocket runs as separate Bun process on port 8081
- MCP server runs directly with Bun (no build step)
- University project - do not share externally

---

**For detailed implementation patterns, see the skills in `.claude/skills/`**
