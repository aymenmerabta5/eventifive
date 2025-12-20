import type { DeviceType } from "@/lib/session-parser";

// Parsed session data with device info
export interface ParsedSession {
	id: string;
	token: string;
	createdAt: Date;
	updatedAt: Date;
	userAgent: string | null;
	ipAddress: string | null;
	deviceLabel: string;
	browser: string;
	os: string;
	deviceType: DeviceType;
	isCurrent: boolean;
}

// Drawer variant type
export type DrawerVariant = "single" | "all";
