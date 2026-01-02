import { Button, Section, Text, Heading, Hr } from "@react-email/components";
import EmailLayout from "./EmailLayout";
import type { BadgeRole } from "@/server/db/schema";

interface BadgeIssuedEmailProps {
  recipientName: string;
  eventTitle: string;
  role: BadgeRole;
  verificationCode: string;
  downloadUrl: string;
  verifyUrl: string;
}

const getRoleDescription = (role: BadgeRole): string => {
  switch (role) {
    case "participant":
      return "Participant";
    case "speaker":
      return "Speaker";
    case "communicator":
      return "Communicator";
    case "reviewer":
      return "Reviewer";
    default:
      return "Attendee";
  }
};

const getRoleColor = (role: BadgeRole): string => {
  switch (role) {
    case "participant":
      return "#3B82F6"; // blue
    case "speaker":
      return "#F59E0B"; // amber
    case "communicator":
      return "#8B5CF6"; // violet
    case "reviewer":
      return "#10B981"; // emerald
    default:
      return "#3B82F6";
  }
};

export function BadgeIssuedEmail({
  recipientName,
  eventTitle,
  role,
  verificationCode,
  downloadUrl,
  verifyUrl,
}: BadgeIssuedEmailProps) {
  const roleColor = getRoleColor(role);

  return (
    <EmailLayout>
      <Section className="bg-card my-6 rounded-lg px-6 py-12 text-center">
        <Section className="text-center">
          <Heading as="h1" className="text-primary mb-2 text-2xl font-bold">
            Eventifive
          </Heading>
          <Heading as="h2" className="text-foreground mb-4 text-3xl font-bold">
            Your Event Badge is Ready!
          </Heading>
          <Text className="text-mutedForeground mb-6 text-base">
            Hi {recipientName}! Your{" "}
            <strong style={{ color: roleColor }}>
              {getRoleDescription(role)}
            </strong>{" "}
            badge for the event has been issued.
          </Text>

          <Section className="bg-muted mb-6 rounded-lg p-4">
            <Text className="text-foreground text-lg font-semibold">
              {eventTitle}
            </Text>
          </Section>

          <Section
            style={{
              backgroundColor: roleColor,
              padding: "8px 24px",
              borderRadius: "20px",
              display: "inline-block",
              marginBottom: "24px",
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                letterSpacing: "2px",
                margin: 0,
              }}
            >
              {getRoleDescription(role).toUpperCase()}
            </Text>
          </Section>

          <Button
            className="bg-primary rounded-lg px-8 py-3 font-semibold text-white"
            href={downloadUrl}
          >
            View & Download Badge
          </Button>

          <Hr className="border-border my-6" />

          <Section className="text-left">
            <Text className="text-mutedForeground mb-2 text-sm">
              <strong>Verification Code:</strong>
            </Text>
            <Text className="text-primary mb-4 text-lg font-bold">
              {verificationCode}
            </Text>
            <Text className="text-mutedForeground text-sm">
              Anyone can verify your badge authenticity by visiting:
            </Text>
            <Text className="text-primary text-sm">
              <a href={verifyUrl}>{verifyUrl}</a>
            </Text>
          </Section>

          <Hr className="border-border my-6" />

          <Text className="text-mutedForeground text-sm">
            We look forward to seeing you at the event!
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}

export default BadgeIssuedEmail;
