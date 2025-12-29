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

// Public profile fields (visible to everyone)
export interface PublicUserData {
  id: string;
  name: string;
  image: string | null;
  imageUrl: string | null;
  institution: string | null;
  researchDomain: string | null;
  biography?: unknown;
  isOwnProfile: false;
  recentEvents?: RecentEvent[];
}

// Full profile fields (visible only to the profile owner)
export interface FullUserData {
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
  isOwnProfile: true;
  recentEvents?: RecentEvent[];
}

// Union type for profile data
export type UserData = PublicUserData | FullUserData;

export interface UserProfileProps {
  user: UserData;
}

export interface TokenStyle {
  label: string;
  classes: string;
}
