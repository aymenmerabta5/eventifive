---
name: api-development
description: Create and modify oRPC API endpoints - routers, procedures, validation, error handling. Use when adding new API routes, modifying existing endpoints, or working with the RPC layer.
---

# API Development (oRPC)

## Methodology - ALWAYS FOLLOW

Before implementing any API changes:

### Step 1: Ask Clarifying Questions
- What HTTP method should this use (GET, POST, PUT, DELETE)?
- Does this need authentication (public vs protected)?
- What input validation is required?
- What should the response shape be?
- Are there related endpoints to consider?
- What errors should be handled?

### Step 2: Enter Plan Mode
Use `EnterPlanMode` to create a detailed implementation plan:
- Review existing routers for patterns
- Check related Zod schemas
- Identify authorization requirements
- Plan error scenarios
- Document the endpoint contract

### Step 3: Deep Analysis (Extended Thinking)
Think deeply about:
- Type safety end-to-end
- Authorization checks (who can access?)
- Input sanitization
- Response optimization
- Error message clarity

### Step 4: Get User Approval
Present the plan and wait for explicit approval before any implementation.

---

## Quick Reference

### Key Files
- Router index: `src/server/orpc/routers/index.ts`
- Procedures: `src/server/orpc/index.ts`
- Context: `src/server/orpc/context.ts`
- Zod schemas: `src/lib/schemas/`
- API endpoint: `src/app/api/rpc/[[...rest]]/route.ts`

### Procedures
- `publicProcedure` - No auth required
- `protectedProcedure` - Requires authenticated session

---

## Patterns

### Creating a Protected Endpoint
```typescript
import { protectedProcedure } from "../index";
import { z } from "zod";

export const myRouter = protectedProcedure
  .route({ method: "POST", path: "/my-feature" })
  .input(z.object({
    data: z.string().min(1).max(100),
  }))
  .output(z.object({
    success: z.boolean(),
    id: z.string(),
  }))
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    // Implementation
    return { success: true, id: "..." };
  });
```

### Creating a Public Endpoint
```typescript
import { publicProcedure } from "../index";

export const listRouter = publicProcedure
  .route({ method: "GET", path: "/items" })
  .output(z.array(itemSchema))
  .handler(async () => {
    return await db.select().from(items);
  });
```

### Adding to App Router
```typescript
// In src/server/orpc/routers/index.ts
import { myRouter } from "./myFeature";

export const appRouter = {
  // ... existing routers
  myFeature: myRouter,
};
```

---

## Error Handling

### Use ORPCError with proper codes
```typescript
import { ORPCError } from "@orpc/server";

// Not found
throw new ORPCError("NOT_FOUND", "Event not found");

// Unauthorized (not logged in)
throw new ORPCError("UNAUTHORIZED", "Please log in");

// Forbidden (logged in but not allowed)
throw new ORPCError("FORBIDDEN", "You don't have permission");

// Bad request (invalid input)
throw new ORPCError("BAD_REQUEST", "Invalid event ID");
```

### Authorization Pattern (assertOrganizer)
```typescript
const event = await db.query.event.findFirst({
  where: eq(event.id, input.eventId),
});

if (!event) {
  throw new ORPCError("NOT_FOUND", "Event not found");
}

if (event.organizerId !== context.session.user.id) {
  throw new ORPCError("FORBIDDEN", "Only the organizer can do this");
}
```

---

## Input Validation Best Practices

### Use Zod Schemas
```typescript
// Define reusable schema in src/lib/schemas/
export const createEventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

// Use in router
.input(createEventSchema)
```

### Common Validations
```typescript
z.string().uuid()           // UUID format
z.string().email()          // Email format
z.string().min(1).max(100)  // Length constraints
z.coerce.date()             // Parse date strings
z.enum(["a", "b", "c"])     // Enum values
z.array(z.string())         // Array of strings
```

---

## Existing Routers (66 endpoints)

| Router | Path | Purpose |
|--------|------|---------|
| events | `/events/*` | Event CRUD, invites |
| files | `/files/*` | Upload/download/delete |
| payment | `/payment/*` | Checkout, status |
| subscription | `/subscription/*` | Plans, current |
| messages | `/messages/*` | Real-time messaging |
| reviews | `/reviews/*` | Submission reviews |
| submissions | `/submissions/*` | Event submissions |
| sessions | `/sessions/*` | Program sessions, rooms |

---

## Type Safety Flow

```
Zod Schema → oRPC Input → Handler → Drizzle Query → oRPC Output → Client
     ↓           ↓           ↓            ↓              ↓           ↓
  Validated   Type-safe   Type-safe   Type-safe     Type-safe   Type-safe
```

All types flow automatically from schema to client.
