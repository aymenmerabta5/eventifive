import {
  IconBuildingBank,
  IconSchool,
  IconTool,
  IconFlask,
  IconMicrophone,
  IconMessage,
} from "@tabler/icons-react";
import type { EventType, TypeConfig, StatusConfig, EventStatus } from "./types";

// Query key for React Query cache
export const QUERY_KEY_PREFIX = "events" as const;

// Pagination
export const PAGE_SIZE = 9;

// Debounce delay for search (ms)
export const SEARCH_DEBOUNCE_MS = 500;

// Type configurations with unique themes using CSS variables
export const TYPE_CONFIG: Record<EventType, TypeConfig> = {
  congress: {
    icon: IconBuildingBank,
    label: "Congress",
    description: "Premier gatherings uniting global leaders and innovators",
    gradient: "from-primary via-chart-2 to-chart-3",
    bgGradient: "from-primary/10 via-chart-2/5 to-transparent",
    accentColor: "text-primary",
    iconBg: "bg-primary",
  },
  seminar: {
    icon: IconSchool,
    label: "Seminar",
    description: "Focused learning sessions with industry thought leaders",
    gradient: "from-chart-3 via-chart-4 to-accent",
    bgGradient: "from-chart-3/10 via-chart-4/5 to-transparent",
    accentColor: "text-chart-3",
    iconBg: "bg-chart-3",
  },
  workshop: {
    icon: IconTool,
    label: "Workshop",
    description: "Hands-on experiences that transform skills into mastery",
    gradient: "from-chart-4 via-chart-5 to-secondary",
    bgGradient: "from-chart-4/10 via-chart-5/5 to-transparent",
    accentColor: "text-chart-4",
    iconBg: "bg-chart-4",
  },
  scientific_meeting: {
    icon: IconFlask,
    label: "Scientific Meeting",
    description: "Where breakthrough research meets collaborative discourse",
    gradient: "from-chart-5 via-primary to-chart-2",
    bgGradient: "from-chart-5/10 via-primary/5 to-transparent",
    accentColor: "text-chart-5",
    iconBg: "bg-chart-5",
  },
  conference: {
    icon: IconMicrophone,
    label: "Conference",
    description: "Dynamic platforms for knowledge exchange and networking",
    gradient: "from-chart-2 via-chart-3 to-chart-4",
    bgGradient: "from-chart-2/10 via-chart-3/5 to-transparent",
    accentColor: "text-chart-2",
    iconBg: "bg-chart-2",
  },
  symposium: {
    icon: IconMessage,
    label: "Symposium",
    description: "Curated dialogues exploring the frontiers of knowledge",
    gradient: "from-accent via-secondary to-primary",
    bgGradient: "from-accent/10 via-secondary/5 to-transparent",
    accentColor: "text-accent",
    iconBg: "bg-accent",
  },
};

// Status configurations for badges
export const STATUS_CONFIG: Record<EventStatus, StatusConfig> = {
  live: {
    label: "Live",
    className:
      "bg-destructive text-destructive-foreground border-destructive shadow-lg shadow-destructive/25",
    dotClassName: "bg-destructive-foreground animate-pulse",
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-chart-4/10 text-chart-4 border-chart-4/30",
  },
  ended: {
    label: "Ended",
    className: "bg-muted text-muted-foreground border-border",
  },
};

// Sort options for the dropdown
export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title_asc", label: "Title (A-Z)" },
  { value: "title_desc", label: "Title (Z-A)" },
] as const;
