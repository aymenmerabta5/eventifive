---
name: database-operations
description: Create and manage database operations with Drizzle ORM - schema changes, queries, migrations, transactions. Use when working with database modifications, adding tables/columns, writing complex queries, or managing data.
---

# Database Operations

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
pnpm db:push      # Push schema to DB (dev - quick iteration)
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Run migrations (production)
pnpm db:studio    # Open Drizzle Studio GUI
pnpm db:seed      # Seed sample data
pnpm db:reset     # Reset database (destructive!)
```

### Key Files
- Schema: `src/server/db/schema.ts`
- Client: `src/server/db/index.ts`
- Config: `drizzle.config.ts`

### Table Prefix
All tables use `eventifive_*` prefix.

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

## Existing Enums (11 total)
- `paymentStatusEnum`: unpaid, pending, paid, refunded
- `billingPeriodEnum`: monthly, yearly
- `subscriptionStatusEnum`: pending, active, cancelled, expired
- `eventSpeakerStatusEnum`: pending, accepted, rejected
- `eventTypeEnum`: conference, workshop, seminar, etc.
- `submissionStatusEnum`: draft, submitted, under_review, accepted, rejected

---

## Core Tables Overview

| Category | Tables |
|----------|--------|
| Auth | user, session, account, verification |
| Events | event, eventImages, eventSettings |
| Invites | eventSpeakers, eventReviewers, eventCommittee |
| Submissions | submission, submissionFile, review, reviewAssignment |
| Schedule | programSession, room, sessionAssignment |
| Payments | subscriptionPlan, subscriptionPrice, userSubscription, payment, eventRegistration |
| Messaging | conversation, message |
| Files | file |
