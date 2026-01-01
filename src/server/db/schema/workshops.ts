import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  serial,
  index,
  unique,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

import { workshopProposalStatusEnum } from "./enums";
import { user } from "./users";
import { event } from "./events";
import { files } from "./files";

// ---------------------------
// WORKSHOPS
// ---------------------------
export const workshop = pgTable(
  "workshop",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    researchDomain: varchar("research_domain", { length: 255 }),
    // Proposal workflow fields
    proposalStatus: workshopProposalStatusEnum("proposal_status")
      .notNull()
      .default("pending"),
    proposedAt: timestamp("proposed_at").notNull().defaultNow(),
    respondedAt: timestamp("responded_at"),
    rejectionReason: text("rejection_reason"),
    // Workshop details
    capacity: integer("capacity"),
    facilitatorId: text("facilitator_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    startAt: timestamp("start_at"),
    endAt: timestamp("end_at"),
  },
  (table) => [
    index("workshop_event_id_idx").on(table.eventId),
    index("workshop_facilitator_id_idx").on(table.facilitatorId),
    index("workshop_proposal_status_idx").on(table.proposalStatus),
  ],
);

// ---------------------------
// WORKSHOP FILES
// ---------------------------
export const workshopFile = pgTable(
  "workshop_file",
  {
    id: text("id").primaryKey(),
    workshopId: text("workshop_id")
      .notNull()
      .references(() => workshop.id, { onDelete: "cascade" }),
    fileId: text("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),
    purpose: varchar("purpose", { length: 100 }), // e.g., "proposal_document", "workshop_material"
    uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  },
  (table) => [index("workshop_file_workshop_id_idx").on(table.workshopId)],
);

// ---------------------------
// WORKSHOP REGISTRATION (Attendees)
// ---------------------------
export const workshopRegistration = pgTable(
  "workshop_registration",
  {
    id: serial("id").primaryKey(),
    workshopId: text("workshop_id")
      .notNull()
      .references(() => workshop.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    registeredAt: timestamp("registered_at").notNull().defaultNow(),
    status: varchar("status", { length: 50 }).notNull().default("registered"),
  },
  (table) => [
    unique("workshop_registration_workshop_user_unique").on(
      table.workshopId,
      table.userId,
    ),
    index("workshop_registration_workshop_id_idx").on(table.workshopId),
    index("workshop_registration_user_id_idx").on(table.userId),
  ],
);

// ---------------------------
// INFERRED TYPES
// ---------------------------
export type Workshop = InferSelectModel<typeof workshop>;
export type NewWorkshop = InferInsertModel<typeof workshop>;

export type WorkshopFile = InferSelectModel<typeof workshopFile>;
export type NewWorkshopFile = InferInsertModel<typeof workshopFile>;

export type WorkshopRegistration = InferSelectModel<typeof workshopRegistration>;
export type NewWorkshopRegistration = InferInsertModel<typeof workshopRegistration>;
