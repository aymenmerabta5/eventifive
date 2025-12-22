---
name: database-operations
description: Create and manage database operations with Drizzle ORM - schema changes, queries, migrations, transactions. Use when working with database modifications, adding tables/columns, writing complex queries, or managing data.
---

# Database Operations (Bun SQL + Drizzle ORM)

## Methodology - ALWAYS FOLLOW

Before implementing any database changes:

### Step 1: Ask Clarifying Questions
- What is the purpose of this change?
- Will this affect existing data? Need migrations?
- Are there related tables that need updates?
- Should we use transactions for data integrity?
- Are there indexes needed for query performance?

### Step 2: Enter Plan Mode
Use `EnterPlanMode` to create a detailed implementation plan:
- Analyze existing schema relationships
- Identify affected tables and foreign keys
- Consider data migration needs
- Plan rollback strategy
- Document the changes

### Step 3: Deep Analysis (Extended Thinking)
Think deeply about:
- Data integrity constraints
- Query performance implications
- Index requirements
- Enum values and their usage
- Relationship cardinality

### Step 4: Get User Approval
Present the plan and wait for explicit approval before any implementation.

---

## Quick Reference

### Commands
```bash
bun run db:push      # Push schema to DB (dev - quick iteration)
bun run db:generate  # Generate migration files
bun run db:migrate   # Run migrations (production)
bun run db:studio    # Open Drizzle Studio GUI
bun run db:seed      # Seed sample data
bun run db:reset     # Reset database (destructive!)
```

### Key Files
- Schema: `src/server/db/schema.ts`
- Client: `src/server/db/index.ts` (Bun SQL)
- Config: `drizzle.config.ts`

### Table Prefix
All tables use `eventifive_*` prefix.

---

## Bun SQL Integration

The database uses Bun's native PostgreSQL driver (`Bun.SQL`) which is ~50% faster than postgres.js.

### Connection Setup
```typescript
import { drizzle } from "drizzle-orm/bun-sql";
import { SQL } from "bun";

const client = new SQL(env.DATABASE_URL);
export const db = drizzle({ client, schema });
```

### Why Bun SQL?
- Native Zig implementation (faster than Node.js drivers)
- No external dependencies
- Automatic connection pooling
- Works with Drizzle ORM seamlessly

---

## Patterns

### Basic Query
```typescript
import { db } from "@/server/db";
import { event } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const events = await db.select()
  .from(event)
  .where(eq(event.organizerId, userId));
```

### Insert
```typescript
await db.insert(event).values({
  id: createId(),
  title: "My Event",
  organizerId: userId,
  // ...
});
```

### Update
```typescript
await db.update(event)
  .set({ title: "Updated Title" })
  .where(eq(event.id, eventId));
```

### Transaction (for related operations)
```typescript
await db.transaction(async (tx) => {
  const [newEvent] = await tx.insert(event).values({ ... }).returning();
  await tx.insert(eventSettings).values({ eventId: newEvent.id, ... });
});
```

### Joins
```typescript
const result = await db.select({
  event: event,
  organizer: user,
}).from(event)
  .innerJoin(user, eq(event.organizerId, user.id))
  .where(eq(event.id, eventId));
```

---

## Schema Design Guidelines

### Adding a New Table
1. Define in `src/server/db/schema.ts`
2. Add appropriate indexes on foreign keys
3. Add to exports
4. Run `pnpm db:push` (dev) or generate migration (prod)

### Adding Columns
1. Add to existing table definition
2. Consider default values for existing rows
3. Update related Zod schemas in `src/lib/schemas/`

### Creating Enums
```typescript
export const myStatusEnum = pgEnum("my_status", [
  "pending",
  "active",
  "completed",
]);
```

### Index Best Practices
- Always index foreign keys
- Index frequently queried columns
- Consider composite indexes for common query patterns

---

## Existing Enums (13 total)
- `rolesEnum`: super_admin, organizer, user
- `certificateRoleEnum`: speaker, committee, reviewer, facilitator
- `paymentStatusEnum`: unpaid, pending, paid, refunded
- `billingPeriodEnum`: monthly, yearly
- `subscriptionStatusEnum`: pending, active, cancelled, expired
- `eventSpeakerStatusEnum`: pending, accepted, rejected
- `eventTypeEnum`: congress, seminar, workshop, scientific_meeting, conference, symposium
- `submissionTypeEnum`: oral, poster, displayed_paper
- `submissionStatusEnum`: draft, accepted, rejected
- `reviewRecommendationEnum`: accept, reject
- `fileTypeEnum`: image, document
- `fileStatusEnum`: pending, completed, failed

---

## Core Tables Overview (30+ tables)

| Category | Tables |
|----------|--------|
| Auth | user, session, account, verification |
| Roles | roles, userRoles |
| Events | event, eventImages |
| Invites | eventSpeakers, eventReviewers, eventCommittee |
| Submissions | submission, submissionFile, review, reviewAssignment |
| Schedule | programSession, room, sessionAssignment, workshop, workshopRegistration |
| Session Q&A | sessionQuestions, sessionQuestionLikes, sessionQuestionAnswers |
| Payments | subscriptionPlan, subscriptionPrice, userSubscription, payment, eventRegistration |
| Messaging | conversations, messages |
| Files | files |
| Certificates | certificate |

---

## New Tables Details

### Roles System
```typescript
// User roles for RBAC
roles: { id, name (super_admin | organizer | user) }
userRoles: { userId, roleId, assignedAt }
```

### Session Q&A
```typescript
// Questions during sessions
sessionQuestions: {
  id, sessionId, userId, content,
  isAnonymous, isApproved, isAnswered, likeCount,
  createdAt, updatedAt
}

// Likes on questions
sessionQuestionLikes: { questionId, userId, createdAt }

// Answers from chairs/organizers
sessionQuestionAnswers: { id, questionId, userId, content, createdAt }
```

### Certificates
```typescript
certificate: {
  id, eventId, userId,
  role (speaker | committee | reviewer | facilitator),
  verificationCode,
  // Snapshots at issue time
  recipientName, recipientEmail,
  eventTitle, eventType, eventStartDate, eventEndDate, eventLocation,
  sessionTitle, contributionDetails,
  // Timestamps
  issuedAt, downloadedAt, revokedAt, revokeReason
}
```

### User Table Updates
```typescript
user: {
  // ... existing fields
  lastSeenAt: timestamp  // For presence system
}
```

### Program Session Updates
```typescript
programSession: {
  // ... existing fields
  qaEnabled: boolean    // Enable Q&A for session
  qaModerated: boolean  // Require approval for questions
}
```
