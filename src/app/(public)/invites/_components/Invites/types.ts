import type { Route } from "next";

// Invite status type
export type InviteStatus = "pending" | "accepted" | "rejected";

// Communicator assignment from API
export interface CommunicatorAssignment {
  id: number;
  eventTitle: string;
  assignedAt: Date;
}

// Backwards compatibility alias
export type CommitteeAssignment = CommunicatorAssignment;

// Speaker invite from API
export interface SpeakerInvite {
  id: number;
  eventId: string;
  eventTitle: string;
  eventType?: string | null;
  status: InviteStatus;
}

// Reviewer invite from API
export interface ReviewerInvite {
  id: number;
  eventId: string;
  eventTitle: string;
  eventType?: string | null;
  status: InviteStatus;
}

// All invites data
export interface InvitesData {
  communicatorAssignments: CommunicatorAssignment[];
  speakerInvites: SpeakerInvite[];
  reviewerInvites: ReviewerInvite[];
}

// Handler interfaces
export interface InviteActionHandlers {
  onAcceptSpeaker: (eventId: string) => void;
  onRejectSpeaker: (eventId: string) => void;
  onAcceptReviewer: (eventId: string) => void;
  onRejectReviewer: (eventId: string) => void;
}
