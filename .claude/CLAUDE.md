# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Eventifive** is a modern event management platform built with Next.js 16, supporting conference and event organization with features like submissions, reviews, payments, subscriptions, real-time messaging, and program/session management.

This is a university project built with professional-grade architecture and cutting-edge technologies.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, React 19, Turbopack, React Compiler) |
| Language | TypeScript (strict mode, `@/*` path aliases) |
| API | oRPC (type-safe, 66 endpoints) |
| Auth | Better Auth (email/password, Google OAuth) |
| Database | Drizzle ORM + PostgreSQL (25+ tables, 30+ indexes) |
| Realtime | WebSocket (port 8081) + Redis (Upstash) |
| UI | Tailwind CSS 4 + shadcn/ui (30+ components) |
| Storage | Cloudflare R2 (S3-compatible) |
| Payments | Chargily (Algerian market) |

## Development Commands

```bash
# Development
pnpm dev              # Start dev server (Next.js + WebSocket on 3000/8081)
pnpm build            # Production build
pnpm preview          # Build and start locally

# Code Quality
pnpm check            # ESLint + TypeScript (preferred)
pnpm lint:fix         # Auto-fix ESLint
pnpm typecheck        # TypeScript only
pnpm format:write     # Prettier format

# Database
pnpm db:push          # Push schema to DB (dev)
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Drizzle Studio GUI
pnpm db:seed          # Seed sample data
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
│   ├── db/                       # Drizzle schema & client
│   ├── better-auth/              # Auth configuration
│   ├── gateway/                  # Chargily integration
│   ├── bucket/                   # R2 file storage
│   └── realtime/                 # WebSocket + Redis
├── lib/
│   ├── schemas/                  # Zod validation
│   └── utils.ts                  # Utility functions
└── mcp/                          # Test data MCP server
```

## Key File Locations

| Domain | Location |
|--------|----------|
| Database Schema | `src/server/db/schema.ts` |
| API Routers | `src/server/orpc/routers/` |
| Auth Config | `src/server/better-auth/config.ts` |
| Zod Schemas | `src/lib/schemas/` |
| UI Components | `src/components/ui/` |
| Environment | `src/env.ts` (validation via @t3-oss/env-nextjs) |

## Environment Variables

Required (see `.env` for full list):
- `DATABASE_URL` - PostgreSQL connection
- `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` - Auth
- `S3_*` / `AWS_*` - R2 storage
- `CHARGILY_SK` - Payments
- `REDIS_REST_*` - Redis

## Security Highlights

- Zod validation on all 66 endpoints
- Drizzle ORM prevents SQL injection
- Ownership validation on mutations (`assertOrganizer` pattern)
- Cloudflare Turnstile CAPTCHA
- Webhook signature verification
- Rate limiting via Arcjet

## Notes

- Use `pnpm` (v10+) as package manager
- Node.js 20+ required
- Database table prefix: `eventifive_*`
- WebSocket must run for real-time features
- University project - do not share externally

---

**For detailed implementation patterns, see the skills in `.claude/skills/`**
