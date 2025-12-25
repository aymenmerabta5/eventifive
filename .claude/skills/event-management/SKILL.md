---
name: event-management
description: Create and manage events, invites (speakers, reviewers, committee), program sessions, rooms, calendar features, certificates, and session Q&A. Use when building event features, managing invitations, certificates, or working with the event lifecycle.
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
| Lifecycle Routers | `src/server/orpc/routers/events/{publish,unpublish,cancel,archive}.ts` |
| Invite Router | `src/server/orpc/routers/events/invites.ts` |
| Session Router | `src/server/orpc/routers/sessions/` |
| Certificates Router | `src/server/orpc/routers/certificates/` |
| Q&A Router | `src/server/orpc/routers/websockets/question-answer/` |
| Event Pages | `src/app/(public)/events/[eventId]/` |
| Session Q&A Page | `src/app/(public)/events/[eventId]/sessions/[sessionId]/qa/` |
| Calendar | `src/app/(public)/events/[eventId]/calender/` |
| Certificates Page | `src/app/(public)/certificates/` |
| My Sessions Page | `src/app/(public)/sessions/` |
| My Registrations | `src/app/(public)/registrations/` |
| Dashboard Forms | `src/app/dashboard/_components/EventActions/` |
| Invites Page | `src/app/(public)/invites/` |
| Certificate Templates | `src/lib/certificates/` |

---

## Event Types
```typescript
eventTypeEnum: "congress" | "seminar" | "workshop" | "scientific_meeting" | "conference" | "symposium"
```

---

## Invite System

### Constraints
- **Speakers**: Unlimited per event (one user can only be invited once per event)
- **Reviewers**: Unlimited per event (one user can only be invited once per event)
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

### Session Structure
- **Chair**: The session moderator/facilitator (one per session)
- **Speakers**: Come from submissions assigned to the session via `sessionAssignment`
- **Q&A Settings**: `qaEnabled` and `qaModerated` flags control Q&A behavior

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
  startAt: new Date("2025-06-15T09:00:00"),
  endAt: new Date("2025-06-15T10:00:00"),
  roomId: 1,  // Room ID (integer)
  chairId: "user-id",  // Optional chair assignment
  meetingLink: "https://...",  // Optional online meeting link
});
```

### Session Chair vs Speakers
- **Chair**: Assigned directly to session (`chairId` field), receives email notification with Q&A link and QR code
- **Speakers**: Authors of submissions assigned to session via `sessionAssignment` table

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

### Status System
Events have an explicit status that controls visibility and registration:

```typescript
eventStatusEnum: "draft" | "published" | "cancelled" | "archived"
```

| Status | Visible to Public | Registrations | Editable |
|--------|-------------------|---------------|----------|
| `draft` | No | No | Yes |
| `published` | Yes | Yes | Yes (with restrictions) |
| `cancelled` | Yes (with notice) | No | No |
| `archived` | No | No | No |

### Status Transitions
```
                    ┌─────────────┐
                    │   draft     │ (initial state)
                    └──────┬──────┘
                           │ publish (endDate >= now)
                           ▼
                    ┌─────────────┐
         ┌──────────│  published  │──────────┐
         │          └──────┬──────┘          │
         │                 │                 │
    unpublish         cancel             archive
  (0 registrations)    (any)          (endDate < now)
         │                 │                 │
         ▼                 ▼                 ▼
    ┌─────────┐      ┌───────────┐    ┌───────────┐
    │  draft  │      │ cancelled │───▶│ archived  │
    └─────────┘      └───────────┘    └───────────┘
```

### Lifecycle Endpoints
```typescript
// Publish a draft event (multiple validations)
events.publish({ eventId })
// Validation:
//   - status=draft
//   - endDate >= now
//   - at least 1 accepted speaker
//   - at least 3 accepted reviewers
// Sets: status="published", publishedAt=now

// Unpublish to draft (BLOCKS if registrations exist)
events.unpublish({ eventId })
// Validation: status=published, 0 registrations
// Sets: status="draft", publishedAt=null

// Cancel event with reason
events.cancel({ eventId, reason?: string })
// Validation: status not cancelled/archived
// Sets: status="cancelled", cancelledAt=now, cancellationReason
// Returns: { registrationCount } for notification purposes

// Archive event (past/cancelled only)
events.archive({ eventId })
// Validation: (endDate < now) OR status=cancelled
// Sets: status="archived", archivedAt=now
```

### Display Status (Computed)
For published events, a display status is computed from dates:

```typescript
type EventDisplayStatus =
  | "Draft"      // status === "draft"
  | "Published"  // status === "published" (generic)
  | "Upcoming"   // published && now < startDate
  | "Live"       // published && startDate <= now <= endDate
  | "Completed"  // published && now > endDate
  | "Cancelled"  // status === "cancelled"
  | "Archived"   // status === "archived"
```

### Critical Rules
1. **Cannot publish past events**: If `endDate < now`, publish is blocked
2. **Can publish ongoing events**: If `startDate < now < endDate`, allowed
3. **Publish requires team**: At least 1 accepted speaker + 3 accepted reviewers
4. **Quota counts only published**: Draft events don't count toward limit
5. **Registration requires published**: Non-published events block registration
6. **Unpublish protected**: Can't unpublish if registrations exist
7. **Published date restrictions**: Can't set endDate to past for published events

### Database Schema Fields
```typescript
// Event table additions
status: eventStatusEnum("status").notNull().default("draft"),
publishedAt: timestamp("published_at"),
cancelledAt: timestamp("cancelled_at"),
archivedAt: timestamp("archived_at"),
cancellationReason: varchar("cancellation_reason", { length: 500 }),
```

### Frontend Status Utilities
```typescript
// src/app/dashboard/_components/MyEvents/utils.ts
getEventDisplayStatus(event)  // Get display status string
getStatusBadgeVariant(status) // Get badge variant for status
canPublish(event)             // Check if can publish
canUnpublish(event)           // Check if can unpublish
canCancel(event)              // Check if can cancel
canArchive(event)             // Check if can archive
```

### 4-Phase Event Management
1. **Setup** - Create event (draft), add details
2. **Publish** - Review and publish to public
3. **Manage** - Handle registrations, submissions, reviews
4. **Complete** - Event ends, archive when done

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

## Certificates System

### Certificate Roles
```typescript
certificateRoleEnum: "speaker" | "committee" | "reviewer" | "facilitator"
```

### Certificate Endpoints
```typescript
// Get eligible recipients for an event
certificates.getEligibleRecipients({ eventId })

// Generate certificates
certificates.generate({ eventId, recipients: [{ userId, role }] })

// List certificates
certificates.listByEvent({ eventId })  // Organizer view
certificates.listMyCertificates()      // User's certificates

// Download/verify
certificates.download({ certificateId })
certificates.verify({ verificationCode })

// Revoke
certificates.revoke({ certificateId, reason })
```

### Certificate Features
- Unique verification codes (QR scannable)
- Snapshots event/user info at issue time
- Email notification on issuance
- Revocation with reason tracking
- PDF generation with template

### Certificate Table Fields
- `role`: speaker, committee, reviewer, facilitator
- `verificationCode`: unique 20-char code
- `recipientName`, `recipientEmail`: snapshot at issue
- `eventTitle`, `eventType`, `eventLocation`: snapshot
- `sessionTitle`: optional for speakers
- `issuedAt`, `downloadedAt`, `revokedAt`

---

## Session Q&A System (Real-time)

### Session Q&A Settings
```typescript
// On programSession table
qaEnabled: boolean   // Enable/disable Q&A (default: true)
qaModerated: boolean // Require approval for questions (default: false)
```

### Q&A Endpoints
```typescript
// Ask questions
qa.ask({ sessionId, content, isAnonymous })

// Get questions
qa.list({ sessionId })

// Like/upvote
qa.like({ questionId })

// Answer (chair/organizer)
qa.answer({ questionId, content })

// Moderate (chair/organizer)
qa.approve({ questionId })
qa.delete({ questionId })

// Real-time subscription
qa.subscribe({ sessionId })  // WebSocket subscription via Redis pub/sub
```

### Q&A Tables
- `sessionQuestions` - Questions with content, anonymous flag, approval status, like count
- `sessionQuestionLikes` - Like tracking (one per user per question)
- `sessionQuestionAnswers` - Answers from chairs/organizers

### Real-time Implementation
- **WebSocket Server**: Bun native WebSocket on port 8081
- **Redis Pub/Sub**: Used for cross-process message broadcasting
- Questions, likes, answers, and approvals broadcast in real-time
- Uses `useQaSubscription` hook on client for subscription management

### Q&A Page Location
`src/app/(public)/events/[eventId]/sessions/[sessionId]/qa/`

---

## My Sessions & Registrations

### My Sessions
```typescript
// Get sessions where user is speaker or chair
sessions.mySessions()  // Returns sessions user is involved in
```

### My Registrations
```typescript
// Get events user registered for
events.myRegistrations()  // Returns user's event registrations with payment status
```

---

## Related Features

- **Submissions**: `src/server/orpc/routers/submissions/`
- **Reviews**: `src/server/orpc/routers/reviews/`
- **Payments**: `src/server/orpc/routers/payment/`
- **Messaging**: `src/server/orpc/routers/websockets/messaging/`
