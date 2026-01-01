"use client";

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { BadgeRole } from "@/server/db/schema";

// Role-specific color configurations
const roleColors = {
  participant: {
    primary: "#3B82F6", // blue-500
    secondary: "#1D4ED8", // blue-700
    light: "#DBEAFE", // blue-100
    text: "#1E3A8A", // blue-900
  },
  speaker: {
    primary: "#F59E0B", // amber-500
    secondary: "#B45309", // amber-700
    light: "#FEF3C7", // amber-100
    text: "#78350F", // amber-900
  },
  reviewer: {
    primary: "#10B981", // emerald-500
    secondary: "#047857", // emerald-700
    light: "#D1FAE5", // emerald-100
    text: "#064E3B", // emerald-900
  },
  communicator: {
    primary: "#8B5CF6", // violet-500
    secondary: "#6D28D9", // violet-700
    light: "#EDE9FE", // violet-100
    text: "#4C1D95", // violet-900
  },
};

const roleLabels: Record<BadgeRole, string> = {
  participant: "PARTICIPANT",
  speaker: "SPEAKER",
  reviewer: "REVIEWER",
  communicator: "COMMUNICATOR",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 0,
    fontFamily: "Helvetica",
  },
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: 20,
    paddingBottom: 15,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  roleBadge: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 12,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 2,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 6,
  },
  eventType: {
    fontSize: 11,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  recipientName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 8,
  },
  affiliation: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    fontStyle: "italic",
  },
  eventDetails: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  eventDate: {
    fontSize: 12,
    color: "#475569",
  },
  eventLocation: {
    fontSize: 11,
    color: "#64748b",
  },
  footer: {
    padding: 20,
    paddingTop: 15,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    borderTop: "1pt solid #e2e8f0",
  },
  qrCode: {
    width: 60,
    height: 60,
  },
  verificationInfo: {
    display: "flex",
    flexDirection: "column",
  },
  verificationLabel: {
    fontSize: 9,
    color: "#94a3b8",
    marginBottom: 2,
  },
  verificationCode: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#334155",
    letterSpacing: 0.5,
  },
  issuedDate: {
    fontSize: 9,
    color: "#94a3b8",
    marginTop: 4,
  },
  branding: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    textAlign: "center",
  },
  brandingText: {
    fontSize: 8,
    color: "#cbd5e1",
  },
  accentBar: {
    height: 6,
  },
});

interface BadgeTemplateProps {
  recipientName: string;
  recipientEmail: string;
  eventTitle: string;
  eventType: string;
  eventStartDate: Date;
  eventEndDate: Date;
  eventLocation: string | null;
  role: BadgeRole;
  affiliation: string | null;
  verificationCode: string;
  issuedAt: Date;
  qrCodeDataUrl: string;
}

const formatEventType = (type: string): string => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateRange = (start: Date, end: Date): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (startDate.toDateString() === endDate.toDateString()) {
    return formatDate(start);
  }

  return `${formatDate(start)} - ${formatDate(end)}`;
};

export function BadgeTemplate({
  recipientName,
  eventTitle,
  eventType,
  eventStartDate,
  eventEndDate,
  eventLocation,
  role,
  affiliation,
  verificationCode,
  issuedAt,
  qrCodeDataUrl,
}: BadgeTemplateProps) {
  const colors = roleColors[role];
  const roleLabel = roleLabels[role];

  return (
    <Document>
      <Page size={[300, 450]} style={styles.page}>
        <View style={styles.container}>
          {/* Top accent bar */}
          <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />

          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.light }]}>
            <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.roleText}>{roleLabel}</Text>
            </View>
            <Text style={styles.eventTitle}>{eventTitle}</Text>
            <Text style={styles.eventType}>{formatEventType(eventType)}</Text>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={[styles.recipientName, { color: colors.secondary }]}>
              {recipientName}
            </Text>
            {affiliation && (
              <Text style={styles.affiliation}>{affiliation}</Text>
            )}
            <View style={styles.eventDetails}>
              <Text style={styles.eventDate}>
                {formatDateRange(eventStartDate, eventEndDate)}
              </Text>
              {eventLocation && (
                <Text style={styles.eventLocation}>{eventLocation}</Text>
              )}
            </View>
          </View>

          {/* Footer with QR and verification */}
          <View style={styles.footer}>
            <Image style={styles.qrCode} src={qrCodeDataUrl} />
            <View style={styles.verificationInfo}>
              <Text style={styles.verificationLabel}>Verification Code</Text>
              <Text style={styles.verificationCode}>{verificationCode}</Text>
              <Text style={styles.issuedDate}>
                Issued {formatDate(issuedAt)}
              </Text>
            </View>
          </View>

          {/* Bottom accent bar */}
          <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />

          {/* Branding */}
          <View style={styles.branding}>
            <Text style={styles.brandingText}>Powered by Eventifive</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default BadgeTemplate;
