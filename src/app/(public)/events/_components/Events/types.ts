import type { Event } from "@/server/db/schema";

// Event card data type
export type EventCardData = Pick<
  Event,
  | "id"
  | "title"
  | "type"
  | "startDate"
  | "endDate"
  | "location"
  | "smallDescription"
> & {
  imageUrl?: string | null;
};

// Events grouped by type from API
export interface EventsByType {
  congress: EventCardData[];
  seminar: EventCardData[];
  workshop: EventCardData[];
  scientific_meeting: EventCardData[];
  conference: EventCardData[];
  symposium: EventCardData[];
}

// Event row configuration
export interface EventRowConfig {
  key: keyof EventsByType;
  title: string;
  description: string;
  route: string;
}
