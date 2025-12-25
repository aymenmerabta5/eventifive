# Eventifive

A modern event management platform built with Next.js 16 and Bun.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun (package manager + runtime) |
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Language | TypeScript (strict mode) |
| API | oRPC (type-safe, 80+ endpoints) |
| Auth | Better Auth (email/password, Google OAuth) |
| Database | Drizzle ORM + Bun SQL (PostgreSQL) |
| Realtime | Bun native WebSocket + Redis/ioredis |
| UI | Tailwind CSS 4 + shadcn/ui |
| Storage | Cloudflare R2 via Bun S3Client |
| Payments | Chargily (Algerian market) |

## Prerequisites

- **Bun 1.1+** - Runtime and package manager
- **PostgreSQL** - Database
- **Redis** - Caching and real-time features

## Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Fill in your environment variables. Required:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/eventifive"
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"
REDIS_URL="redis://localhost:6379"
```

See `.env.example` for the complete list.

### 3. Database Setup

```bash
bun run db:push      # Push schema (dev)
bun run db:seed      # Seed sample data
bun run db:studio    # Open Drizzle Studio
```

### 4. Run Development Server

```bash
bun run dev
```

Starts Next.js at `http://localhost:3000` and WebSocket at `ws://localhost:8081`.

## Scripts

```bash
# Development
bun run dev           # Start dev server (Next.js + WebSocket)
bun run build         # Production build
bun run preview       # Build and start locally

# Code Quality
bun run check         # ESLint + TypeScript
bun run lint:fix      # Auto-fix ESLint
bun run typecheck     # TypeScript only
bun run format:write  # Prettier format

# Database
bun run db:push       # Push schema to DB
bun run db:generate   # Generate migrations
bun run db:migrate    # Run migrations
bun run db:studio     # Drizzle Studio GUI
bun run db:seed       # Seed sample data
bun run db:init       # Reset + Generate + Push + Seed

# WebSocket
bun run ws            # WebSocket server only
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth pages (login, signup)
│   ├── (public)/           # Public pages (events, certificates)
│   ├── dashboard/          # Protected dashboard
│   ├── messages/           # Real-time messaging
│   └── api/                # API routes (auth, rpc, webhooks)
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── rich-text-editor/   # TipTap editor
├── server/
│   ├── orpc/routers/       # API routers (12 domains)
│   ├── db/                 # Drizzle schema & Bun SQL
│   ├── better-auth/        # Auth configuration
│   ├── gateway/            # Chargily integration
│   ├── bucket/             # R2 file storage
│   ├── cache/              # Redis caching
│   └── realtime/           # WebSocket + Redis
├── lib/
│   ├── schemas/            # Zod validation
│   ├── certificates/       # Certificate generation
│   └── emails/             # Email templates
└── mcp/                    # Test data MCP server
```

## Key Features

**Event Management**
- Multiple event types (congress, seminar, workshop, conference, symposium)
- Event lifecycle (draft, published, cancelled, archived)
- Speaker, reviewer, and committee invitations
- Event registration with payment processing

**Certificates**
- Generate certificates for speakers, reviewers, committee, facilitators
- QR code verification
- Email notifications and revocation support

**Session Q&A**
- Real-time questions during sessions
- Like/upvote questions
- Moderation support
- Anonymous question option

**Real-time Features**
- Direct messaging with presence indicators
- WebSocket-based live updates
- Redis pub/sub for scaling

**Submissions & Reviews**
- Abstract and paper submissions
- Review assignments and workflow
- Accept/reject with comments

## API Structure

```typescript
// Procedure types
publicProcedure     // No auth required
protectedProcedure  // Requires login
adminProcedure      // Requires super_admin role
```

12 API routers: admin, organizer, events, profile, files, payment, subscription, messages, qa, submissions, reviews, sessions, certificates.

## License

This project is proprietary and confidential. All rights reserved.

---

**eventifive**
