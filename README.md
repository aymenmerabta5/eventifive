# Eventifive

**Version:** 0.1.0  
**Status:** Private / Proprietary

Eventifive is a modern event management platform built with Next.js 16 and the latest web technologies.

## 🔒 License

**This project is proprietary and confidential.**

All rights reserved. This software and its source code are the exclusive property of eventifive. Unauthorized copying, distribution, modification, or use of this software is strictly prohibited. See the [LICENSE](./LICENSE) file for full details.

## 🛠️ Technology Stack

This project is built with:

**Core Framework:**
- **[Next.js 16](https://nextjs.org)** - React framework with App Router, Turbopack, and React Compiler
- **[React 19](https://react.dev)** - UI library with latest features
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety throughout

**Backend & API:**
- **[oRPC](https://orpc.unnoq.com/)** - Type-safe API layer with OpenAPI support
- **[Better Auth](https://www.better-auth.com/)** - Modern authentication solution
- **[Drizzle ORM](https://orm.drizzle.team)** - TypeScript ORM for PostgreSQL
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[WebSocket (ws)](https://github.com/websockets/ws)** - Real-time communication server

**Data & State Management:**
- **[Tanstack Query](https://tanstack.com/query)** - Powerful data synchronization
- **[Redis (Upstash)](https://upstash.com/)** - Caching and pub/sub

**UI & Styling:**
- **[Tailwind CSS 4](https://tailwindcss.com)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component patterns
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible components
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Lucide Icons](https://lucide.dev/)** - Icon library

**File Storage & Services:**
- **[Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/)** - S3-compatible object storage
- **[Resend](https://resend.com/)** - Email service
- **[Chargily](https://chargily.com/)** - Payment gateway (Algerian market)

**Security & Validation:**
- **[Arcjet](https://arcjet.com/)** - Security and rate limiting
- **[Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)** - CAPTCHA alternative
- **[Zod](https://zod.dev/)** - Schema validation

## 📋 Prerequisites

- **Node.js 20+** - Runtime environment
- **pnpm 10+** - Package manager (required, not npm/yarn)
- **PostgreSQL** - Database server
- **Redis** (optional for local dev) - For caching and real-time features (can use Upstash cloud)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the root directory. Copy `.env.example` and fill in your values:

```bash
cp .env.example .env
```

**Core Required Variables:**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/eventifive"

# Authentication
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"
RESEND_SENDER_EMAIL="your-verified@email.com"

# Security
CLOUDFLARE_TURNSTYLE_SK="your-turnstile-secret-key"
NEXT_PUBLIC_CLOUDFLARE_TURNSTYLE_PK="your-turnstile-public-key"
ARCJET_API="your-arcjet-key"

# File Storage (Cloudflare R2)
NEXT_PUBLIC_S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
S3_BUCKET_NAME="your-bucket-name"
AWS_ACCESS_KEY_ID="your-r2-access-key"
AWS_SECRET_ACCESS_KEY="your-r2-secret-key"

# Redis (Upstash)
REDIS_REST_URL="your-redis-url"
REDIS_REST_TOKEN="your-redis-token"

# WebSocket
NEXT_PUBLIC_WEBSOCKET_URL="ws://localhost:8081"
```

**Optional Variables:**
- `CHARGILY_SK` / `NEXT_PUBLIC_CHARGILY_PK` - Payment gateway (optional in development)
- `OPEN_AI_API_KEY` - OpenAI integration (optional)

See [.env.example](.env.example) for the complete list with detailed descriptions.

### 3. Database Setup

```bash
# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Or push schema directly (for development)
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

### 4. Run Development Server

```bash
pnpm dev
```

This command starts both:
- Next.js development server at [http://localhost:3000](http://localhost:3000)
- WebSocket server at `ws://localhost:8081`

Both servers run concurrently for full real-time functionality.

## 📜 Available Scripts

**Development:**
- `pnpm dev` - Start development server (Next.js + WebSocket) with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server (Next.js + WebSocket)
- `pnpm preview` - Build and preview production locally
- `pnpm ws` - Run WebSocket server independently

**Code Quality:**
- `pnpm check` - Run both lint and typecheck (recommended)
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors automatically
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm format:check` - Check code formatting
- `pnpm format:write` - Format code with Prettier

**Database:**
- `pnpm db:push` - Push schema changes directly (fast, for development)
- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio GUI
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:reset` - Reset database (⚠️ destructive)

## 📁 Project Structure

```
eventifive/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages (login, signup, etc.)
│   │   ├── (public)/          # Public pages (landing, events, pricing)
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Better Auth endpoints
│   │   │   ├── rpc/           # oRPC API endpoints
│   │   │   └── arcjet/        # Security middleware
│   │   └── dashboard/         # Protected dashboard pages
│   ├── components/            # React components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                   # Utility libraries and helpers
│   ├── server/                # Server-side code
│   │   ├── better-auth/      # Authentication configuration
│   │   ├── bucket/           # S3/R2 file storage
│   │   ├── db/               # Database schema, connection, seeds
│   │   ├── gateway/          # Payment gateway integration
│   │   ├── orpc/             # oRPC routers, context, procedures
│   │   ├── realtime/         # WebSocket server and Redis
│   │   └── utils/            # Server utilities
│   ├── env.ts                 # Environment variable validation
│   └── styles/               # Global styles
├── .env.example               # Environment variables template
├── CLAUDE.md                  # Claude Code development guide
├── LICENSE                    # Proprietary license
└── README.md                 # This file
```

## 🔐 Authentication

This project uses [Better Auth](https://www.better-auth.com/) for authentication, providing:

- **Email/Password authentication** with email verification
- **Google OAuth** social login
- **Password reset** via email (Resend integration)
- **Session management** with secure cookies
- **CAPTCHA protection** with Cloudflare Turnstile
- **Type-safe auth client** for React components
- Separate configurations for HTTP and WebSocket servers

## 🗄️ Database Management

The project uses Drizzle ORM with PostgreSQL:

- **Type-safe database queries** with full TypeScript support
- **Automatic migrations** with `drizzle-kit`
- **Visual database browser** with Drizzle Studio
- **Schema defined in** `src/server/db/schema.ts`

**Key entities:**
- Users, Roles, and Authentication (Better Auth tables)
- Events (congress, seminar, workshop, conference, symposium)
- Submissions (oral, poster, workshop, demo) with review workflow
- Reviews and Review Assignments
- Program Sessions, Rooms, and Workshops
- Event Registration and Payments
- File Storage metadata
- Messaging (conversations and messages)

## 🔌 API Layer (oRPC)

The project uses [oRPC](https://orpc.unnoq.com/) for type-safe API communication:

- **Type-safe procedures** - Full TypeScript inference from server to client
- **OpenAPI documentation** - Auto-generated at `/api/rpc/api-reference`
- **Public & Protected routes** - Authentication middleware built-in
- **WebSocket RPC support** - Real-time bidirectional communication
- **Input/Output validation** - Zod schemas for all endpoints

**API Structure:**
- `publicProcedure` - No authentication required
- `protectedProcedure` - Requires authenticated session
- Routers in `src/server/orpc/routers/`
- HTTP endpoint: `/api/rpc`
- WebSocket endpoint: `ws://localhost:8081`

## 📡 Real-time Features

WebSocket server provides real-time capabilities:

- **Live messaging** - Direct user-to-user conversations
- **Redis pub/sub** - Event broadcasting across server instances
- **Session authentication** - Secure WebSocket connections
- **oRPC over WebSocket** - Same type-safe API patterns as HTTP

## 📦 File Storage

Cloudflare R2 integration for file uploads:

- **Presigned URLs** - Secure client-side uploads
- **File types** - Images and documents
- **Metadata tracking** - Database records for all files
- **Upload workflow**: Request URL → Client upload → Confirm completion

## 💳 Payment Integration

Chargily payment gateway for Algerian market:

- Event registration payments
- DZD currency support
- Webhook handling for payment status
- Optional in development mode

## 🎨 UI Components

UI components are built with:

- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [shadcn/ui](https://ui.shadcn.com/) patterns - Pre-built component patterns
- [Tailwind CSS](https://tailwindcss.com) - Styling with v4 features
- [Lucide Icons](https://lucide.dev/) - Icon library
- [Framer Motion](https://www.framer.com/motion/) - Animations
- Dark mode support with `next-themes`

## ⚙️ Key Features

**Event Management:**
- Multiple event types (congress, seminar, workshop, conference, symposium)
- Event creation and organization
- Speaker and committee management
- Event registration with payment processing

**Submission System:**
- Abstract and paper submissions (oral, poster, workshop, demo)
- Multi-author support
- File upload with metadata tracking
- Submission status workflow (draft → submitted → under review → accepted/rejected)

**Review Process:**
- Reviewer assignments
- Review recommendations (accept, minor/major revision, reject)
- Comments and scoring system
- Due date tracking

**Program Management:**
- Session scheduling
- Room assignments
- Workshop registration with capacity limits
- Session-to-submission assignments

**User System:**
- Role-based access control (super_admin, admin, communicator, scientific_committee_member, participant, speaker, workshop_facilitator)
- User profiles with institution and research domain
- Biography management with rich text

**Messaging:**
- Direct user-to-user conversations
- Real-time message delivery via WebSocket
- Message history and persistence

## ⚙️ Configuration Files

- `next.config.ts` - Next.js configuration (typed routes, React Compiler)
- `tailwind.config.ts` - Tailwind CSS v4 configuration (auto-generated)
- `drizzle.config.ts` - Drizzle ORM configuration
- `eslint.config.js` - ESLint flat config
- `tsconfig.json` - TypeScript configuration with strict mode
- `components.json` - shadcn/ui component configuration
- `.env.example` - Environment variables template
- `CLAUDE.md` - Development guide for Claude Code

## 🚫 Restrictions

**IMPORTANT:** This is proprietary software. You may not:

- Use this software for commercial purposes
- Redistribute or share the source code
- Modify or create derivative works
- Deploy publicly without authorization
- Reverse engineer the software

For licensing inquiries, please contact the project owner.

---

**© 2025 eventifive. All rights reserved.**
