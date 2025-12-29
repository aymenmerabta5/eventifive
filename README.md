# Eventifive

A modern event management platform built with Next.js 16 and Bun, supporting conference and event organization with real-time features, payments, subscriptions, certificates, and more.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun (package manager + runtime via `--bun` flag) |
| Framework | Next.js 16 (App Router, React 19, Turbopack, React Compiler) |
| Language | TypeScript (strict mode, `@/*` path aliases) |
| API | oRPC (type-safe, 80+ endpoints across 12 routers) |
| Auth | Better Auth (email/password, Google OAuth, RBAC) |
| Database | Drizzle ORM + Bun SQL (PostgreSQL, 34+ tables) |
| Realtime | Bun native WebSocket (port 8081) + Redis/ioredis (Upstash) |
| UI | Tailwind CSS 4 + shadcn/ui (36+ components) |
| Storage | Cloudflare R2 via Bun S3Client (native) |
| Payments | Chargily (Algerian market) |
| Caching | Redis via ioredis (dashboard stats, presence, rate limiting) |

## Prerequisites

- **Bun 1.1+** - Runtime and package manager
- **PostgreSQL** - Database
- **Redis** - Caching, real-time features, and rate limiting

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
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, signup, reset-password)
│   ├── (public)/                 # Public pages (events, certificates, settings)
│   │   ├── events/               # Event listing, details, registration
│   │   ├── certificates/         # Certificate viewing and verification
│   │   ├── messages/             # Real-time messaging
│   │   ├── sessions/             # User's sessions (chair/facilitator)
│   │   ├── registrations/        # User's event registrations
│   │   ├── invites/              # Speaker/reviewer/committee invites
│   │   ├── pricing/              # Subscription plans
│   │   └── verify/[code]/        # Certificate verification
│   ├── dashboard/                # Protected organizer/admin dashboard
│   └── api/                      # API routes
│       ├── auth/                 # Better Auth handler
│       ├── rpc/                  # oRPC endpoints
│       ├── webhooks/chargily/    # Payment webhooks
│       └── arcjet/               # Bot detection
├── components/
│   ├── ui/                       # shadcn/ui components (36+)
│   └── rich-text-editor/         # TipTap WYSIWYG editor
├── server/
│   ├── orpc/                     # API layer
│   │   ├── routers/              # 12 domain routers (80+ endpoints)
│   │   ├── index.ts              # Procedure types & middleware
│   │   ├── context.ts            # Session context
│   │   └── ratelimit.ts          # Rate limiting config
│   ├── db/                       # Drizzle schema & Bun SQL
│   │   └── schema/               # 8 domain schemas (34+ tables)
│   ├── better-auth/              # Auth configuration
│   ├── gateway/                  # Chargily integration
│   ├── bucket/                   # R2 file storage (Bun S3Client)
│   ├── cache/                    # Redis caching layer
│   └── realtime/                 # WebSocket + Redis pub/sub
│       ├── ws.ts                 # Bun native WebSocket server
│       ├── presence.ts           # Online status tracking
│       ├── pubsub.ts             # Message broadcasting
│       ├── typing.ts             # Typing indicators
│       ├── read-receipts.ts      # Message read tracking
│       └── session-qa.ts         # Session Q&A system
├── lib/
│   ├── schemas/                  # Zod validation schemas
│   ├── certificates/             # Certificate generation (PDF, QR)
│   └── emails/                   # React Email templates
└── mcp/                          # Test data MCP server
```

## Key Features

### Event Management
- **Event Types**: Congress, Seminar, Workshop, Scientific Meeting, Conference, Symposium
- **Lifecycle**: Draft → Published → Cancelled/Archived with explicit status transitions
- **Multi-image Gallery**: Event cover images with Cloudflare R2 storage
- **Rich Text Descriptions**: TipTap editor for event details
- **Invitations**: Invite speakers, reviewers, and committee members
- **Registration**: Free event registration with payment support for paid events

### Certificates System
- Generate certificates for speakers, reviewers, committee members, and facilitators
- PDF generation with @react-pdf/renderer
- QR code verification with unique verification codes
- Email notifications on certificate issuance
- Public verification page with revocation support

### Session Q&A (Real-time)
- Ask questions during sessions with anonymous option
- Like/upvote questions for prioritization
- Moderation support (qaModerated flag on sessions)
- Real-time updates via WebSocket + Redis pub/sub
- Session chairs get email notifications with QR code

### Messaging System (Real-time)
- Direct 1-on-1 messaging with presence indicators
- WebSocket-based live updates
- Typing indicators with 3-second TTL
- Read receipts tracking
- Redis pub/sub for message broadcasting

### Presence System
- Real-time online status using Redis TTL (60s)
- Heartbeat-based presence tracking
- `lastSeenAt` tracking in database for offline users
- Connection limiting (5 connections per user)

### Submissions & Reviews
- Abstract and paper submissions (oral, poster, displayed paper)
- Reviewer assignments with automatic assignment on acceptance
- Review workflow with accept/reject recommendations

### Payments & Subscriptions
- Chargily payment gateway integration
- Subscription plans with event quotas
- Race condition prevention with database transactions
- Webhook signature verification
- Support for subscription and event registration payments

### Dashboard
- Organizer dashboard with event stats and charts
- Admin dashboard for platform-wide statistics
- Redis-based caching with cache invalidation

## API Structure (oRPC)

### Procedure Types

```typescript
publicProcedure     // No auth required
protectedProcedure  // Requires login
adminProcedure      // Requires super_admin role
```

### Rate Limiting (per user, per minute)

| Category | Limit | Use Case |
|----------|-------|----------|
| Payment | 5/min | Subscription checkouts |
| File Upload | 10/min | Image/document uploads |
| Messaging | 30/min | Real-time messages |
| Q&A | 20/min | Session questions |
| Registration | 10/min | Event registration |
| General | 100/min | Other protected endpoints |

### API Routers (12 domains, 80+ endpoints)

| Router | Endpoints | Description |
|--------|-----------|-------------|
| admin | 1 | Platform-wide statistics |
| organizer | 2 | Organizer dashboard stats & charts |
| events | 28+ | Event CRUD, lifecycle, invites, registration |
| profile | 3 | User profile management |
| files | 5 | Upload/download with presigned URLs |
| payment | 4 | Chargily checkout integration |
| subscription | 4 | Plan management |
| messages | 12 | Real-time messaging + presence |
| qa | 7 | Session Q&A operations |
| submissions | 4 | Event submissions |
| reviews | 2 | Submission reviews |
| sessions | 10 | Program sessions, rooms |
| certificates | 7 | Generate, download, verify, revoke |

## Database Schema (34+ tables)

### Domain Organization

| Domain | Tables | Key Features |
|--------|--------|--------------|
| Users | 6 | user, roles, userRoles, session, account, verification |
| Events | 6 | event, eventImages, eventCommittee, eventSpeakers, eventReviewers, eventRegistration |
| Files | 1 | files (S3 metadata) |
| Submissions | 4 | submission, submissionFile, review, reviewAssignment |
| Sessions | 8 | room, programSession, sessionAssignment, workshop, workshopRegistration, sessionQuestions, sessionQuestionLikes, sessionQuestionAnswers |
| Payments | 4 | subscriptionPlan, subscriptionPrice, userSubscription, payment |
| Messaging | 3 | conversations, messages, readReceipts |
| Certificates | 1 | certificate (with verification codes) |

### Key Enums

```typescript
rolesEnum: "super_admin" | "organizer" | "user"
eventTypeEnum: "congress" | "seminar" | "workshop" | "scientific_meeting" | "conference" | "symposium"
eventStatusEnum: "draft" | "published" | "cancelled" | "archived"
paymentStatusEnum: "unpaid" | "pending" | "paid" | "refunded"
subscriptionStatusEnum: "pending" | "active" | "cancelled" | "expired"
certificateRoleEnum: "speaker" | "committee" | "reviewer" | "facilitator"
```

## Real-time Architecture

### WebSocket Server (Bun Native)

```
Port: 8081
Authentication: Better Auth session from headers
Connection Limit: 5 per user
Heartbeat: 30s minimum interval
Presence TTL: 60 seconds
```

### Redis Channels (HMAC-hashed for security)

- `presence:updates` - Global presence events
- `user:{hash}:messages` - User's message notifications
- `conversation:{hash}` - Conversation messages
- `typing:{hash}` - Typing indicators
- `read:{hash}` - Read receipts
- `session:{hash}:qa` - Session Q&A events

### Subscription Manager

Single Redis connection for all pub/sub subscriptions (prevents Upstash connection exhaustion).

## Security Features

### Authentication & Authorization
- Better Auth with Drizzle adapter
- Three-tier RBAC (user, organizer, super_admin)
- Session-based authentication with token management
- Google OAuth integration

### API Security
- Zod validation on all 80+ endpoints
- Drizzle ORM prevents SQL injection
- Ownership validation (`assertOrganizer` pattern)
- Rate limiting with Redis backend
- Webhook signature verification (Chargily)

### Additional Security
- Cloudflare Turnstile CAPTCHA
- Arcjet bot detection and rate limiting
- File upload validation (MIME type + extension matching)
- HMAC-hashed Redis channels
- Connection limiting per user

## Environment Variables

### Required Server Variables
- `DATABASE_URL` - PostgreSQL connection
- `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` - Auth configuration
- `REDIS_URL` - Redis for caching/pub-sub
- `S3_*` / `AWS_*` - Cloudflare R2 storage
- `CHARGILY_SK` - Payment gateway
- `RESEND_API_KEY` - Email service
- `CLOUDFLARE_TURNSTYLE_SK` - CAPTCHA
- `ARCJET_API` - Bot detection
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth

### Required Client Variables
- `NEXT_PUBLIC_WEBSOCKET_URL` - WebSocket endpoint
- `NEXT_PUBLIC_S3_ENDPOINT` - S3/R2 endpoint
- `NEXT_PUBLIC_CLOUDFLARE_TURNSTYLE_PK` - CAPTCHA public key

## Email Templates

Built with React Email for cross-client compatibility:
- **CertificateIssuedEmail** - Certificate notification with download link
- **ResetPasswordEmail** - Password reset with secure link
- **SessionChairAssignedEmail** - Chair notification with QR code
- **EmailLayout** - Base template with Tailwind styles

## UI Components (36+)

### shadcn/ui Components
Layout, Forms, Dialogs, Data Display, Navigation, Charts, and more.

### Custom Components
- Rich Text Editor (TipTap)
- Calendar View (week/day scheduling)
- Certificate Viewer
- Conversation List & Message View

## Deployment

### Port Configuration
- Next.js: 3000 (API on `/api/rpc`)
- WebSocket: 8081 (separate Bun process)

### API Documentation
Auto-generated OpenAPI at `/api/rpc/api-reference`

## Architecture Highlights

- **Type Safety**: Full TypeScript with Zod schemas on all endpoints
- **Real-time**: WebSocket + Redis pub/sub for messaging and Q&A
- **Performance**: Redis caching, presigned URLs, batch operations
- **Security**: Multi-layer rate limiting, ownership validation, input sanitization
- **Scalability**: Modular schema design, connection pooling, cache invalidation

## License

This project is proprietary and confidential. All rights reserved.

---

**Eventifive** - Modern Event Management Platform
