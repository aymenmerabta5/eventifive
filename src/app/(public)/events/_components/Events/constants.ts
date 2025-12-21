import type { EventRowConfig } from "./types";

// Query keys for React Query cache
export const QUERY_KEY = ["events"] as const;

// Event row configurations
export const EVENT_ROWS: EventRowConfig[] = [
  {
    key: "congress",
    title: "Congress",
    description:
      "Join us for an exciting scientific meeting featuring cutting-edge research presentations and networking opportunities with leading experts in the field.",
    route: "/events/type/congress",
  },
  {
    key: "seminar",
    title: "Seminar",
    description:
      "Explore the latest technological innovations and trends. Connect with industry leaders and discover groundbreaking solutions shaping the future.",
    route: "/events/type/seminar",
  },
  {
    key: "workshop",
    title: "Workshop",
    description:
      "Hands-on learning experience designed to enhance your skills. Interactive sessions with practical exercises and expert guidance.",
    route: "/events/type/workshop",
  },
  {
    key: "scientific_meeting",
    title: "Scientific Meeting",
    description:
      "Join us for an exciting scientific meeting featuring cutting-edge research presentations and networking opportunities with leading experts in the field.",
    route: "/events/type/scientific-meeting",
  },
  {
    key: "conference",
    title: "Conference",
    description:
      "Explore the latest technological innovations and trends. Connect with industry leaders and discover groundbreaking solutions shaping the future.",
    route: "/events/type/conference",
  },
  {
    key: "symposium",
    title: "Symposium",
    description:
      "Join us for an exciting symposium featuring cutting-edge research presentations and networking opportunities with leading experts in the field.",
    route: "/events/type/symposium",
  },
];
