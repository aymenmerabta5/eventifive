---
name: event-management
description: Create and manage events, invites (speakers, reviewers, committee), program sessions, rooms, and calendar features. Use when building event features, managing invitations, or working with the event lifecycle.
---

# Event Management

## Methodology - ALWAYS FOLLOW

Before implementing any event-related changes:

### Step 1: Ask Clarifying Questions
- Which event type is this for (conference, workshop, seminar)?
- Does this involve the invite system (speaker/reviewer/committee)?
- Are there calendar/session scheduling needs?
- What authorization checks are needed (organizer only?)?
- Does this affect event registration or payments?

### Step 2: Enter Plan Mode
Use `EnterPlanMode` to create a detailed implementation plan:
- Review existing event flow
- Check invite system constraints
- Consider calendar integration
- Plan notification requirements
- Document user flows

### Step 3: Deep Analysis (Extended Thinking)
Think deeply about:
- Event lifecycle states
- Invite acceptance/rejection flows
- Session scheduling conflicts
- Room capacity constraints
- Multi-step form handling

### Step 4: Get User Approval
Present the plan and wait for explicit approval before any implementation.

---

## Key Files

| Component | Location |
|-----------|----------|
| Event Router | `src/server/orpc/routers/events/` |
| Invite Router | `src/server/orpc/routers/events/invites.ts` |
| Session Router | `src/server/orpc/routers/sessions/` |
| Event Pages | `src/app/(public)/events/[eventType]/[eventId]/` |
| Calendar | `src/app/(public)/events/[eventType]/[eventId]/calender/` |
| Dashboard Forms | `src/app/dashboard/_components/EventActions/` |
| Invites Page | `src/app/(public)/invites/` |

---

## Event Types
```typescript
eventTypeEnum: conference, workshop, seminar, webinar, meetup, hackathon
```

---

## Invite System

### Constraints
- **Speakers**: Max 1 per event
- **Reviewers**: Max 3 per event
- **Committee**: Unlimited

### Status Flow
```
pending → accepted
        → rejected
```

### Key Endpoints
```typescript
// Send invites (organizer only)
events.inviteSpeaker({ eventId, speakerId })
events.inviteReviewer({ eventId, reviewerId })
events.inviteCommittee({ eventId, committeeId })

// Respond to invites (invited user)
events.acceptSpeaker({ eventId })
events.rejectSpeaker({ eventId })
events.acceptReviewer({ eventId })
events.rejectReviewer({ eventId })

// List invites
events.listMyInvites()  // User's received invites
events.listInvites({ eventId })  // Event's sent invites
```

### Database Tables
- `eventSpeakers` - Speaker invitations
- `eventReviewers` - Reviewer invitations
- `eventCommittee` - Committee assignments

---

## Program Sessions & Rooms

### Creating a Room
```typescript
await client.sessions.createRoom({
  eventId,
  name: "Main Hall",
  capacity: 100
});
```

### Creating a Session
```typescript
await client.sessions.createSession({
  eventId,
  title: "Opening Keynote",
  startTime: new Date("2025-06-15T09:00:00"),
  endTime: new Date("2025-06-15T10:00:00"),
  roomId: "room-id",
});
```

### Assigning Speakers
```typescript
await client.sessions.assignSpeaker({ sessionId, speakerId });
```

### Calendar Components
- `CalendarView` - Main calendar display
- `CalendarControls` - Navigation (week/day views)
- `CalendarDayColumn` - Day column layout
- `CalendarHoursColumn` - Time slots
- `SessionCard` - Session display

---

## Event Form System

### Multi-Step Flow
1. **Event Details** - Title, description, dates, type
2. **Image Uploads** - Cover image + 3 gallery images
3. **Invites** - Speakers, reviewers, committee
4. **Review** - Final confirmation

### Form Hooks
```typescript
useEventForm()      // Main form state
useEventDraft()     // Draft saving
useEventUpdate()    // Update existing
useEventPrefill()   // Prefill from existing
useEventInvites()   // Manage invites
useEventRooms()     // Manage rooms
useEventSessions()  // Manage sessions
```

### Image Constraints
- 1 cover image (required)
- Up to 3 gallery images (optional)
- 10MB max per image

---

## Event Lifecycle

### 4-Phase Management
1. **Setup** - Create event, add details
2. **Invites** - Invite speakers, reviewers
3. **Submissions** - Accept submissions, assign reviewers
4. **Program** - Schedule sessions, assign rooms

---

## Common Patterns

### Check Event Ownership
```typescript
const event = await db.query.event.findFirst({
  where: eq(event.id, eventId),
});

if (event.organizerId !== context.session.user.id) {
  throw new ORPCError("FORBIDDEN", "Only organizer can modify");
}
```

### Auto-assign Reviewer to Submissions
When a reviewer accepts an invite, they're automatically assigned to existing submissions for that event.

### Date Validation
- End date must be after start date
- Dynamic validation in forms

---

## Related Features

- **Submissions**: `src/server/orpc/routers/submissions/`
- **Reviews**: `src/server/orpc/routers/reviews/`
- **Payments**: `src/server/orpc/routers/payment/`
