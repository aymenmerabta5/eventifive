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

// Re-export formatRelativeTimeLong as formatSessionDate for backwards compatibility
export { formatRelativeTimeLong as formatSessionDate } from "@/lib/date";
