import { IconCheck, IconHourglass, IconX } from "@tabler/icons-react";
import type { ApplicationStatus, StatusConfig } from "./types";

// Query key for React Query cache
export const QUERY_KEY = ["my-applications"] as const;

// Status configuration mapping
export const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  draft: {
    label: "Draft",
    icon: IconHourglass,
    className:
      "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  },
  pending: {
    label: "Pending Review",
    icon: IconHourglass,
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  accepted: {
    label: "Accepted",
    icon: IconCheck,
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  rejected: {
    label: "Not Accepted",
    icon: IconX,
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
};

// Application group configuration
export const APPLICATION_GROUPS = {
  accepted: {
    title: "Accepted",
    accentColor:
      "bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/25",
    defaultOpen: true,
  },
  pending: {
    title: "Pending Review",
    accentColor:
      "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/25",
    defaultOpen: true,
  },
  rejected: {
    title: "Not Accepted",
    accentColor:
      "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/25",
    defaultOpen: false,
  },
} as const;
