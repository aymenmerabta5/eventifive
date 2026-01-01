import type { JSONContent } from "@tiptap/react";
import type { EventType, EventSpeakerStatus } from "@/server/db/schema";

export type EventFormMode = "create" | "update";
export type WizardStep = "details" | "invites" | "sessions" | "review";

export interface EventFormValues {
  title: string;
  description: string;
  bigDescription: JSONContent | undefined;
  type: "" | EventType;
  startDate: string;
  endDate: string;
  location: string;
  priceAmount: number;
  priceCurrency: string;
}

export interface EventUpdateValues extends EventFormValues {
  eventId: string;
}

export interface SpeakerInvite {
  id: number;
  eventId: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  affiliation: string | null;
  status: EventSpeakerStatus;
  invitedAt: Date;
  respondedAt: Date | null;
}

export interface ReviewerInvite {
  id: number;
  eventId: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  status: EventSpeakerStatus;
  invitedAt: Date;
  respondedAt: Date | null;
}

export interface Communicator {
  id: number;
  eventId: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  assignedAt: Date;
}

export interface EventFormCardProps {
  mode: EventFormMode;
  eventId?: string;
}

export interface EventReadiness {
  speakerCount: number;
  speakersAccepted: number;
  reviewerCount: number;
  reviewersAccepted: number;
  isReady: boolean;
}

export interface InvitesData {
  speakers: SpeakerInvite[];
  reviewers: ReviewerInvite[];
  communicators: Communicator[];
}
