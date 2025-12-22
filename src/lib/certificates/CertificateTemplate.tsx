"use client";

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { CertificateRole } from "@/server/db/schema";

// Register fonts for formal certificate look
Font.register({
  family: "Times New Roman",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/@canvas-fonts/times-new-roman@1.0.4/Times%20New%20Roman.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@canvas-fonts/times-new-roman@1.0.4/Times%20New%20Roman%20Bold.ttf",
      fontWeight: "bold",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@canvas-fonts/times-new-roman@1.0.4/Times%20New%20Roman%20Italic.ttf",
      fontStyle: "italic",
    },
  ],
});

// Formal certificate styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFEF7",
    padding: 40,
    fontFamily: "Times New Roman",
  },
  outerBorder: {
    border: "3pt solid #1a365d",
    padding: 8,
    height: "100%",
  },
  innerBorder: {
    border: "1pt solid #c5a255",
    padding: 30,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a365d",
    letterSpacing: 3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#c5a255",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  divider: {
    width: 150,
    height: 2,
    backgroundColor: "#c5a255",
    marginVertical: 15,
  },
  mainContent: {
    textAlign: "center",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  certifyText: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 20,
    fontStyle: "italic",
  },
  recipientName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1a365d",
    marginBottom: 20,
    textAlign: "center",
  },
  roleText: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 8,
  },
  roleHighlight: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#c5a255",
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a365d",
    marginTop: 15,
    marginBottom: 10,
    textAlign: "center",
  },
  eventDetails: {
    fontSize: 12,
    color: "#4a5568",
    marginBottom: 5,
    textAlign: "center",
  },
  sessionTitle: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#4a5568",
    marginTop: 10,
    textAlign: "center",
  },
  footer: {
    textAlign: "center",
    marginTop: 30,
  },
  verificationSection: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 20,
  },
  qrPlaceholder: {
    width: 80,
    height: 80,
    border: "1pt solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7fafc",
  },
  qrText: {
    fontSize: 8,
    color: "#a0aec0",
    textAlign: "center",
  },
  verificationInfo: {
    textAlign: "left",
  },
  verificationLabel: {
    fontSize: 10,
    color: "#718096",
    marginBottom: 3,
  },
  verificationCode: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a365d",
    letterSpacing: 1,
  },
  issuedDate: {
    fontSize: 10,
    color: "#718096",
    marginTop: 8,
  },
  cornerDecoration: {
    position: "absolute",
    width: 30,
    height: 30,
  },
  topLeft: {
    top: 15,
    left: 15,
    borderTop: "2pt solid #c5a255",
    borderLeft: "2pt solid #c5a255",
  },
  topRight: {
    top: 15,
    right: 15,
    borderTop: "2pt solid #c5a255",
    borderRight: "2pt solid #c5a255",
  },
  bottomLeft: {
    bottom: 15,
    left: 15,
    borderBottom: "2pt solid #c5a255",
    borderLeft: "2pt solid #c5a255",
  },
  bottomRight: {
    bottom: 15,
    right: 15,
    borderBottom: "2pt solid #c5a255",
    borderRight: "2pt solid #c5a255",
  },
});

interface CertificateTemplateProps {
  recipientName: string;
  eventTitle: string;
  eventType: string;
  eventStartDate: Date;
  eventEndDate: Date;
  eventLocation: string | null;
  role: CertificateRole;
  sessionTitle: string | null;
  verificationCode: string;
  issuedAt: Date;
}

const getRoleText = (role: CertificateRole): { title: string; description: string } => {
  switch (role) {
    case "speaker":
      return {
        title: "CERTIFICATE OF APPRECIATION",
        description: "for their valuable contribution as a Speaker",
      };
    case "committee":
      return {
        title: "CERTIFICATE OF APPRECIATION",
        description: "for their dedication as a Committee Member",
      };
    case "reviewer":
      return {
        title: "CERTIFICATE OF APPRECIATION",
        description: "for their expertise as a Reviewer",
      };
    case "facilitator":
      return {
        title: "CERTIFICATE OF APPRECIATION",
        description: "for leading the workshop as a Facilitator",
      };
    default:
      return {
        title: "CERTIFICATE OF PARTICIPATION",
        description: "for their participation",
      };
  }
};

const formatEventType = (type: string): string => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateRange = (start: Date, end: Date): string => {
  const startStr = formatDate(start);
  const endStr = formatDate(end);
  if (startStr === endStr) {
    return startStr;
  }
  return `${startStr} - ${endStr}`;
};

export function CertificateTemplate({
  recipientName,
  eventTitle,
  eventType,
  eventStartDate,
  eventEndDate,
  eventLocation,
  role,
  sessionTitle,
  verificationCode,
  issuedAt,
}: CertificateTemplateProps) {
  const roleInfo = getRoleText(role);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            {/* Corner Decorations */}
            <View style={[styles.cornerDecoration, styles.topLeft]} />
            <View style={[styles.cornerDecoration, styles.topRight]} />
            <View style={[styles.cornerDecoration, styles.bottomLeft]} />
            <View style={[styles.cornerDecoration, styles.bottomRight]} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{roleInfo.title}</Text>
              <Text style={styles.subtitle}>{formatEventType(eventType)}</Text>
            </View>

            <View style={styles.divider} />

            {/* Main Content */}
            <View style={styles.mainContent}>
              <Text style={styles.certifyText}>
                This is to certify that
              </Text>

              <Text style={styles.recipientName}>{recipientName}</Text>

              <Text style={styles.roleText}>{roleInfo.description}</Text>

              <Text style={styles.eventTitle}>{eventTitle}</Text>

              <Text style={styles.eventDetails}>
                {formatDateRange(eventStartDate, eventEndDate)}
              </Text>

              {eventLocation && (
                <Text style={styles.eventDetails}>{eventLocation}</Text>
              )}

              {sessionTitle && (
                <Text style={styles.sessionTitle}>
                  Workshop: {sessionTitle}
                </Text>
              )}
            </View>

            <View style={styles.divider} />

            {/* Footer with Verification */}
            <View style={styles.footer}>
              <View style={styles.verificationSection}>
                <View style={styles.qrPlaceholder}>
                  <Text style={styles.qrText}>
                    Scan to{"\n"}verify
                  </Text>
                </View>
                <View style={styles.verificationInfo}>
                  <Text style={styles.verificationLabel}>Verification Code</Text>
                  <Text style={styles.verificationCode}>{verificationCode}</Text>
                  <Text style={styles.issuedDate}>
                    Issued on {formatDate(issuedAt)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default CertificateTemplate;
