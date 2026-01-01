# Eventifive

A modern event management platform built with Next.js 16 and Bun, supporting conference and event organization with real-time features, payments, subscriptions, certificates, and more.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun (package manager + runtime via `--bun` flag) |
| Framework | Next.js 16 (App Router, React 19, Turbopack, React Compiler) |
| Language | TypeScript (strict mode, `@/*` path aliases) |
| API | oRPC (type-safe, 100+ endpoints across 16 routers) |
| Auth | Better Auth (email/password, Google OAuth, RBAC) |
| Database | Drizzle ORM + Bun SQL (PostgreSQL, 35+ tables) |
| Realtime | Bun native WebSocket (port 8081) + Redis/ioredis (Upstash) |
| UI | Tailwind CSS 4 + shadcn/ui (40+ components) |
| Animations | motion/react (wizard progress, form transitions) |
| Storage | Cloudflare R2 via Bun S3Client (native) |
| Payments | Chargily (Algerian market) |
| AI | OpenRouter + Vercel AI SDK (Nvidia Nemotron model) |
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
│   │   ├── events/               # Event listing, details, registration, reviews, workshops
│   │   ├── certificates/         # Certificate viewing and verification
│   │   ├── messages/             # Real-time messaging
│   │   ├── sessions/             # User's sessions (chair/facilitator)
│   │   ├── registrations/        # User's event registrations + badge download
│   │   ├── invites/              # Speaker/reviewer/communicator invites
│   │   ├── pricing/              # Subscription plans
│   │   ├── verify/[code]/        # Certificate verification
│   │   └── verify-badge/[code]/  # Badge verification (public)
│   ├── dashboard/                # Protected organizer/admin dashboard
│   └── api/                      # API routes
│       ├── auth/                 # Better Auth handler
│       ├── rpc/                  # oRPC endpoints
│       ├── webhooks/chargily/    # Payment webhooks
│       └── arcjet/               # Bot detection
├── components/
│   ├── ui/                       # shadcn/ui components (40+)
│   ├── uploader/                 # Modular file uploader (5 hooks, 7 components)
│   └── rich-text-editor/         # TipTap WYSIWYG editor
├── server/
│   ├── ai/                       # AI integration (OpenRouter + Vercel AI SDK)
│   ├── better-auth/              # Auth configuration
│   ├── bucket/                   # R2 file storage (Bun S3Client)
│   ├── cache/                    # Redis caching layer
│   ├── db/                       # Drizzle schema & Bun SQL
│   │   └── schema/               # 13 domain schemas (40+ tables)
│   ├── gateway/                  # Chargily integration
│   ├── orpc/                     # API layer
│   │   ├── routers/              # 16 domain routers (100+ endpoints)
│   │   ├── index.ts              # Procedure types & middleware
│   │   ├── context.ts            # Session context
│   │   └── ratelimit.ts          # Rate limiting config
│   ├── realtime/                 # WebSocket + Redis pub/sub
│   │   ├── ws.ts                 # Bun native WebSocket server
│   │   ├── presence.ts           # Online status tracking
│   │   ├── pubsub.ts             # Message broadcasting
│   │   ├── typing.ts             # Typing indicators
│   │   ├── read-receipts.ts      # Message read tracking
│   │   └── session-qa.ts         # Session Q&A system
│   ├── styles/                   # Server-side style utilities
│   ├── tests/                    # Server test utilities
│   └── utils/                    # Server utility functions
├── lib/
│   ├── schemas/                  # Zod validation schemas
│   ├── certificates/             # Certificate generation (PDF, QR)
│   ├── emails/                   # React Email templates
│   └── badges/                   # Badge generation (issueBadge, verification)
└── mcp/                          # MCP server for test data generation
    └── src/tools/
        ├── invites/              # Modular invite management (refactored)
        │   ├── speakers.ts       # Speaker invitation tools (4 tools)
        │   ├── reviewers.ts      # Reviewer invitation tools (4 tools)
        │   ├── committee.ts      # Committee management (3 tools)
        │   ├── user-view.ts      # User invitation listing (1 tool)
        │   └── helpers.ts        # Shared utilities
        ├── events.ts             # Event CRUD tools
        ├── users.ts              # User management tools
        ├── submissions.ts        # Submission tools
        ├── reviews.ts            # Review tools
        └── seed.ts               # Database seeding
```

## Key Features

### Event Management
- **Event Types**: Congress, Seminar, Workshop, Scientific Meeting, Conference, Symposium
- **Lifecycle**: Draft → Published → Cancelled/Archived with explicit status transitions
- **Multi-image Gallery**: Event cover images with Cloudflare R2 storage
- **Rich Text Descriptions**: TipTap editor for event details
- **Invitations**: Invite speakers, reviewers, and communicator members
- **Registration**: Free event registration with payment support for paid events
- **Multi-Step Wizard**: Animated 4-step wizard for event creation (Details → Invites → Sessions → Review)

### Badges System
- Generate digital badges for participants, speakers, reviewers, and communicator members
- QR code verification with unique verification codes (`BDG-YYYY-XXXXXXXX`)
- Automatic badge issuance on:
  - Event registration (free events)
  - Payment confirmation (paid events)
  - Speaker/reviewer/communicator invite acceptance
  - Workshop proposal acceptance
- Email notifications with verification links
- Public verification page at `/verify-badge/[code]`
- Revocation support with reason tracking

### Certificates System
- Generate formal certificates for speakers, reviewers, communicator members, and facilitators
- PDF generation with @react-pdf/renderer and embedded QR codes
- Unique verification codes (`EVT-YYYY-XXXXXXXX`)
- Email notifications on certificate issuance
- Public verification page at `/verify/[code]` with revocation support
- Data snapshots prevent inconsistencies if event details change

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
- Communicator reviews page for assigned reviewers

### Workshops System (New)
- Workshop proposal submission with file attachments
- Multi-step proposal form (personal info, workshop details, files)
- Proposal management for organizers (accept/reject with reasons)
- Automatic badge issuance on proposal acceptance
- Capacity tracking for workshop slots

### Poll System (Real-time, New)
- Create polls during sessions with multiple options
- Real-time voting via WebSocket + Redis pub/sub
- Vote tracking and result aggregation
- Poll lifecycle management (open, close, archive)

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

### AI-Powered Features
- **Provider**: OpenRouter with Vercel AI SDK
- **Model**: Nvidia Nemotron 3 Nano 30B (`nvidia/nemotron-3-nano-30b-a3b:free`)
- **Event Description Generation**: AI-generated short and long descriptions for events
  - Short description: 1-2 sentence summary for cards and listings
  - Long description: 2-3 paragraph TipTap-compatible rich text
- **Authorization**: Requires active subscription OR super_admin role
- **Rate Limited**: Dedicated AI rate limiting to prevent abuse

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
| AI | 10/min | AI description generation |
| General | 100/min | Other protected endpoints |

### API Routers (16 domains, 100+ endpoints)

| Router | Endpoints | Description |
|--------|-----------|-------------|
| admin | 1 | Platform-wide statistics |
| organizer | 2 | Organizer dashboard stats & charts |
| events | 28+ | Event CRUD, lifecycle, invites, registration |
| profile | 3 | User profile management |
| files | 5 | Upload/download with presigned URLs |
| payment | 4 | Chargily checkout integration |
| subscription | 4 | Plan management |
| websockets | - | Real-time features container |
| ↳ messages | 12 | Real-time messaging + presence |
| ↳ qa | 7 | Session Q&A operations |
| submissions | 4 | Event submissions |
| reviews | 2 | Submission reviews |
| sessions | 10 | Program sessions, rooms |
| certificates | 7 | Generate, download, verify, revoke |
| badges | 5 | Badge generation, download, verify, revoke |
| ai | 1 | AI-powered event description generation |
| workshops | 6 | Propose, accept/reject, list proposals |

## Database Schema (40+ tables)

### Domain Organization

| Domain | Tables | Key Features |
|--------|--------|--------------|
| Users | 6 | user, roles, userRoles, session, account, verification |
| Events | 6 | event, eventImages, eventCommunicators, eventSpeakers, eventReviewers, eventRegistration |
| Files | 1 | files (S3 metadata) |
| Communicators | 4 | submission, submissionFile, review, reviewAssignment |
| Sessions | 6 | room, programSession, sessionAssignment, sessionQuestions, sessionQuestionLikes, sessionQuestionAnswers |
| Workshops | 3 | workshop, workshopProposal, workshopProposalFiles |
| Polls | 3 | poll, pollOption, pollVote |
| Payments | 4 | subscriptionPlan, subscriptionPrice, userSubscription, payment |
| Messaging | 3 | conversations, messages, readReceipts |
| Certificates | 1 | certificate (with verification codes, data snapshots) |
| Badges | 1 | badge (with verification codes, auto-issuance tracking) |

### Key Enums

```typescript
rolesEnum: "super_admin" | "organizer" | "user"
eventTypeEnum: "congress" | "seminar" | "workshop" | "scientific_meeting" | "conference" | "symposium"
eventStatusEnum: "draft" | "published" | "cancelled" | "archived"
paymentStatusEnum: "unpaid" | "pending" | "paid" | "refunded"
subscriptionStatusEnum: "pending" | "active" | "cancelled" | "expired"
certificateRoleEnum: "speaker" | "communicator" | "reviewer" | "facilitator"
badgeRoleEnum: "participant" | "speaker" | "reviewer" | "communicator"
workshopProposalStatusEnum: "pending" | "accepted" | "rejected"
pollStatusEnum: "draft" | "open" | "closed"
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
- `session:{hash}:polls` - Session poll events (votes, status changes)

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
- `OPENROUTER_API_KEY` - AI features (optional, enables AI description generation)

### Required Client Variables
- `NEXT_PUBLIC_WEBSOCKET_URL` - WebSocket endpoint
- `NEXT_PUBLIC_S3_ENDPOINT` - S3/R2 endpoint
- `NEXT_PUBLIC_CLOUDFLARE_TURNSTYLE_PK` - CAPTCHA public key

## Email Templates

Built with React Email for cross-client compatibility:
- **CertificateIssuedEmail** - Certificate notification with download link
- **BadgeIssuedEmail** - Badge notification with verification link
- **ResetPasswordEmail** - Password reset with secure link
- **SessionChairAssignedEmail** - Chair notification with QR code
- **EmailLayout** - Base template with Tailwind styles

## UI Components (40+)

### shadcn/ui Components
Layout, Forms, Dialogs, Data Display, Navigation, Charts, and more.

### Custom Components
- **Rich Text Editor** (TipTap) - WYSIWYG editor for event descriptions
- **Calendar View** - Week/day scheduling for program sessions
- **Certificate Viewer** - PDF display with download
- **Conversation List & Message View** - Real-time messaging UI
- **Event Form Wizard** - Animated 4-step wizard with progress indicator (Details → Invites → Sessions → Review)

### Modular Uploader Component (Refactored)
File upload component split into reusable hooks and presentational components:

**Hooks (5 custom hooks):**
- `useUploader` - Main orchestrator coordinating all upload state
- `useFileDragDrop` - Drag-over state and file drop handling
- `useImageReorder` - Drag-to-reorder functionality for images
- `usePreviewUrls` - Blob URL management with memory cleanup
- `useUploadQuota` - Upload quota fetching for documents

**Components (7 presentational):**
- `DropZone` - Drag-drop file input area
- `ImageGrid` / `ImageCard` - Image preview grid with cover badge
- `FileList` / `FileItem` - Document file list display
- `AddMoreSlot` - Add more files button
- `UploaderActions` - Upload/clear action buttons

**Supports:** Event images (JPEG/PNG/WebP/GIF) and registration documents (PDF/DOC/DOCX)

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
