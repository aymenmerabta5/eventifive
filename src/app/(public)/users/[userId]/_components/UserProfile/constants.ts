import type { TokenStyle, EventStatus, EventRole } from "./types";

export const STATUS_TOKENS: Record<EventStatus, TokenStyle> = {
  upcoming: {
    label: "Upcoming",
    classes: "bg-primary/10 text-primary border-primary/30",
  },
  attending: {
    label: "Attending",
    classes: "bg-primary/15 text-primary border-primary/30",
  },
  past: {
    label: "Completed",
    classes: "bg-muted/60 text-muted-foreground border-border/60",
  },
};

export const ROLE_TOKENS: Record<string, TokenStyle> = {
  speaker: {
    label: "Speaker",
    classes: "bg-primary/10 text-primary border-primary/30",
  },
  reviewer: {
    label: "Reviewer",
    classes: "bg-amber-100/20 text-amber-500 border-amber-500/30",
  },
  communicator: {
    label: "Communicator",
    classes: "bg-indigo-100/20 text-indigo-500 border-indigo-500/30",
  },
  organizer: {
    label: "Organizer",
    classes: "bg-emerald-100/20 text-emerald-600 border-emerald-500/30",
  },
  admin: {
    label: "Admin",
    classes: "bg-rose-100/20 text-rose-600 border-rose-500/30",
  },
  attendee: {
    label: "Attendee",
    classes: "bg-muted/50 text-muted-foreground border-border/60",
  },
  mentor: {
    label: "Mentor",
    classes: "bg-sky-100/20 text-sky-600 border-sky-500/30",
  },
  judge: {
    label: "Judge",
    classes: "bg-purple-100/20 text-purple-600 border-purple-500/30",
  },
};

export const DEFAULT_ROLE_TOKEN: TokenStyle = {
  label: "Participant",
  classes: "bg-background/60 text-foreground border-border/50",
};

export const MAX_RECENT_EVENTS = 4;
