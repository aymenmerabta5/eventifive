export type EventRole =
  | "speaker"
  | "reviewer"
  | "committee"
  | "attendee"
  | "organizer"
  | "admin"
  | "participant"
  | "workshop_facilitator"
  | "mentor"
  | "judge"
  | string;

export type EventStatus = "upcoming" | "past" | "attending";

export interface RecentEvent {
  id: string;
  title: string;
  date: string | Date;
  location?: string;
  role?: EventRole;
  status?: EventStatus;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  imageUrl: string | null;
  institution: string | null;
  researchDomain: string | null;
  biography?: unknown;
  createdAt: Date;
  updatedAt: Date;
  recentEvents?: RecentEvent[];
}

export interface UserProfileProps {
  user: UserData;
}

export interface TokenStyle {
  label: string;
  classes: string;
}
