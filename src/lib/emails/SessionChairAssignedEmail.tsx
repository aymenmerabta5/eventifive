import {
  Button,
  Section,
  Text,
  Heading,
  Hr,
  Img,
} from "@react-email/components";
import EmailLayout from "./EmailLayout";

interface SessionChairAssignedEmailProps {
  recipientName: string;
  sessionTitle: string;
  eventTitle: string;
  sessionDate: string;
  sessionTime: string;
  roomName: string | null;
  qaUrl: string;
  qrCodeDataUrl: string;
}

export function SessionChairAssignedEmail({
  recipientName,
  sessionTitle,
  eventTitle,
  sessionDate,
  sessionTime,
  roomName,
  qaUrl,
  qrCodeDataUrl,
}: SessionChairAssignedEmailProps) {
  return (
    <EmailLayout>
      <Section className="bg-card my-6 rounded-lg px-6 py-12 text-center">
        <Section className="text-center">
          <Heading as="h1" className="text-primary mb-2 text-2xl font-bold">
            Eventifive
          </Heading>
          <Heading as="h2" className="text-foreground mb-4 text-3xl font-bold">
            You&apos;re the Session Chair!
          </Heading>
          <Text className="text-mutedForeground mb-6 text-base">
            Hello {recipientName}, you have been assigned as the chair for the
            following session.
          </Text>

          <Section className="bg-muted mb-6 rounded-lg p-4 text-left">
            <Text className="text-foreground mb-2 text-lg font-semibold">
              {sessionTitle}
            </Text>
            <Text className="text-mutedForeground mb-1 text-sm">
              <strong>Event:</strong> {eventTitle}
            </Text>
            <Text className="text-mutedForeground mb-1 text-sm">
              <strong>Date:</strong> {sessionDate}
            </Text>
            <Text className="text-mutedForeground mb-1 text-sm">
              <strong>Time:</strong> {sessionTime}
            </Text>
            {roomName && (
              <Text className="text-mutedForeground text-sm">
                <strong>Room:</strong> {roomName}
              </Text>
            )}
          </Section>

          <Hr className="border-border my-6" />

          <Heading
            as="h3"
            className="text-foreground mb-4 text-xl font-semibold"
          >
            Session Q&A QR Code
          </Heading>
          <Text className="text-mutedForeground mb-4 text-sm">
            Share this QR code with attendees so they can ask questions during
            your session. You can print it or display it on screen.
          </Text>

          <Section className="mb-4 rounded-lg bg-white p-4">
            <Img
              src={qrCodeDataUrl}
              width={200}
              height={200}
              alt="Session Q&A QR Code"
              className="mx-auto"
            />
          </Section>

          <Button
            className="bg-primary rounded-lg px-8 py-3 font-semibold text-white"
            href={qaUrl}
          >
            Open Q&A Dashboard
          </Button>

          <Hr className="border-border my-6" />

          <Section className="text-left">
            <Text className="text-mutedForeground mb-2 text-sm">
              <strong>Direct Q&A Link:</strong>
            </Text>
            <Text className="text-primary text-sm">
              <a href={qaUrl}>{qaUrl}</a>
            </Text>
          </Section>

          <Hr className="border-border my-6" />

          <Text className="text-mutedForeground text-sm">
            As session chair, you can moderate questions, approve pending
            questions (if moderation is enabled), and answer questions during
            the session.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}

export default SessionChairAssignedEmail;
