import { UAParser } from "ua-parser-js";

export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

export interface ParsedUserAgent {
  browser: string;
  os: string;
  deviceType: DeviceType;
  deviceLabel: string;
}

/**
 * Parse a userAgent string into readable device information
 */
export function parseUserAgent(userAgent: string | null): ParsedUserAgent {
  if (!userAgent) {
    return {
      browser: "Unknown Browser",
      os: "Unknown OS",
      deviceType: "unknown",
      deviceLabel: "Unknown Device",
    };
  }

  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  const browserName = browser.name || "Unknown Browser";
  const osName = os.name || "Unknown OS";
  const osVersion = os.version ? ` ${os.version}` : "";

  const deviceType = getDeviceType(device.type);
  const deviceLabel = `${browserName} on ${osName}${osVersion}`;

  return {
    browser: browserName,
    os: `${osName}${osVersion}`,
    deviceType,
    deviceLabel,
  };
}

function getDeviceType(type: string | undefined): DeviceType {
  if (!type) return "desktop"; // Default to desktop if no type specified
  if (type === "mobile") return "mobile";
  if (type === "tablet") return "tablet";
  return "unknown";
}

/**
 * Format a date as relative time (e.g., "Active now", "5 minutes ago", "2 days ago")
 */
export function formatSessionDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "Active now";
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}
