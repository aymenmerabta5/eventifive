# eventifive

**Version:** 0.1.0  
**Status:** Private / Proprietary

eventifive is a modern event management platform built with Next.js 16 and the latest web technologies.

## 🔒 License

**This project is proprietary and confidential.**

All rights reserved. This software and its source code are the exclusive property of eventifive. Unauthorized copying, distribution, modification, or use of this software is strictly prohibited. See the [LICENSE](./LICENSE) file for full details.

## 🛠️ Technology Stack

This project is built with:

- **[Next.js 16](https://nextjs.org)** - React framework with App Router
- **[React 19](https://react.dev)** - UI library with latest features
- **[Better Auth](https://www.better-auth.com/)** - Modern authentication solution
- **[Drizzle ORM](https://orm.drizzle.team)** - TypeScript ORM for PostgreSQL
- **[oRPC](https://orpc.unnoq.com/)** - Type-safe API layer
- **[Tailwind CSS 4](https://tailwindcss.com)** - Utility-first CSS framework
- **[Tanstack Query](https://tanstack.com/query)** - Powerful data synchronization
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety throughout
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database

## 📋 Prerequisites

- Node.js 20+ 
- pnpm 10+ (package manager)
- PostgreSQL database

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the root directory with required environment variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/eventifive"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
```

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

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm preview` - Build and preview production locally
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors automatically
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm check` - Run both lint and typecheck
- `pnpm format:check` - Check code formatting
- `pnpm format:write` - Format code with Prettier
- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio

## 📁 Project Structure

```
eventifive/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (public)/          # Public pages
│   │   ├── api/               # API routes
│   │   └── dashboard/         # Dashboard pages
│   ├── components/            # React components
│   │   └── ui/               # UI components (shadcn/ui)
│   ├── lib/                   # Utility libraries
│   ├── server/                # Server-side code
│   │   ├── better-auth/      # Authentication configuration
│   │   ├── db/               # Database schema and connection
│   │   └── orpc/             # oRPC routers and context
│   ├── styles/               # Global styles
│   └── utils/                # Utility functions
├── LICENSE                    # Proprietary license
└── README.md                 # This file
```

## 🔐 Authentication

This project uses [Better Auth](https://www.better-auth.com/) for authentication, providing:

- Email/Password authentication
- Session management
- Secure credential handling
- Type-safe auth client

## 🗄️ Database Management

The project uses Drizzle ORM with PostgreSQL:

- Type-safe database queries
- Automatic migrations
- Visual database browser with Drizzle Studio
- Schema defined in `src/server/db/schema.ts`

## 🎨 UI Components

UI components are built with:

- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [shadcn/ui](https://ui.shadcn.com/) patterns - Pre-built component patterns
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Lucide Icons](https://lucide.dev/) - Icon library
- Dark mode support with `next-themes`

## ⚙️ Configuration Files

- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration (auto-generated)
- `drizzle.config.ts` - Drizzle ORM configuration
- `eslint.config.js` - ESLint configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui component configuration

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
