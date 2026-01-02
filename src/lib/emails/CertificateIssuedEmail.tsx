import { Button, Section, Text, Heading, Hr } from "@react-email/components";
import EmailLayout from "./EmailLayout";
import type { CertificateRole } from "@/server/db/schema";

interface CertificateIssuedEmailProps {
  recipientName: string;
  eventTitle: string;
  role: CertificateRole;
  verificationCode: string;
  downloadUrl: string;
  verifyUrl: string;
}

const getRoleDescription = (role: CertificateRole): string => {
  switch (role) {
    case "speaker":
      return "Speaker";
    case "communicator":
      return "Communicator";
    case "reviewer":
      return "Reviewer";
    case "facilitator":
      return "Workshop Facilitator";
    default:
      return "Participant";
  }
};

export function CertificateIssuedEmail({
  recipientName,
  eventTitle,
  role,
  verificationCode,
  downloadUrl,
  verifyUrl,
}: CertificateIssuedEmailProps) {
  return (
    <EmailLayout>
      <Section className="bg-card my-6 rounded-lg px-6 py-12 text-center">
        <Section className="text-center">
          <Heading as="h1" className="text-primary mb-2 text-2xl font-bold">
            Eventifive
          </Heading>
          <Heading as="h2" className="text-foreground mb-4 text-3xl font-bold">
            Your Certificate is Ready!
          </Heading>
          <Text className="text-mutedForeground mb-6 text-base">
            Congratulations, {recipientName}! Your certificate of appreciation
            as a <strong>{getRoleDescription(role)}</strong> for the event has
            been issued.
          </Text>

          <Section className="bg-muted mb-6 rounded-lg p-4">
            <Text className="text-foreground text-lg font-semibold">
              {eventTitle}
            </Text>
          </Section>

          <Button
            className="bg-primary rounded-lg px-8 py-3 font-semibold text-white"
            href={downloadUrl}
          >
            Download Certificate
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
              Anyone can verify your certificate authenticity by visiting:
            </Text>
            <Text className="text-primary text-sm">
              <a href={verifyUrl}>{verifyUrl}</a>
            </Text>
          </Section>

          <Hr className="border-border my-6" />

          <Text className="text-mutedForeground text-sm">
            Thank you for your contribution to the event. We appreciate your
            participation!
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}

export default CertificateIssuedEmail;
