import type { Event } from "@/server/db/schema";

export type AdminEvent = Event & { imageUrl: string | null };

export interface EventStats {
	total: number;
	upcoming: number;
	past: number;
	draft: number;
	published: number;
	cancelled: number;
}
