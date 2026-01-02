import { Button, Section, Text, Heading, Hr } from "@react-email/components";
import EmailLayout from "./EmailLayout";

interface WorkshopStatusEmailProps {
  recipientName: string;
  eventTitle: string;
  workshopTitle: string;
  status: "accepted" | "rejected";
  viewUrl: string;
}

export function WorkshopStatusEmail({
  recipientName,
  eventTitle,
  workshopTitle,
  status,
  viewUrl,
}: WorkshopStatusEmailProps) {
  const isAccepted = status === "accepted";
  const statusColor = isAccepted ? "#22c55e" : "#ef4444";
  const statusText = isAccepted ? "Accepted" : "Not Accepted";

  return (
    <EmailLayout title={`Workshop ${statusText} - Eventifive`}>
      <Section className="bg-card my-6 rounded-lg px-6 py-12">
        <Section className="text-center">
          <Heading as="h1" className="text-primary mb-2 text-2xl font-bold">
            Eventifive
          </Heading>
          <Heading as="h2" className="text-foreground mb-4 text-3xl font-bold">
            {isAccepted ? "Congratulations!" : "Workshop Proposal Update"}
          </Heading>
          <Text className="text-mutedForeground mb-6 text-base">
            Hi {recipientName}, we have an update regarding your workshop
            proposal.
          </Text>

          <Section className="bg-muted mb-6 rounded-lg p-4">
            <Text className="text-foreground text-lg font-semibold">
              {workshopTitle}
            </Text>
            <Text className="text-mutedForeground text-sm">{eventTitle}</Text>
          </Section>

          <Section
            style={{
              backgroundColor: statusColor,
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
              {statusText.toUpperCase()}
            </Text>
          </Section>

          {isAccepted ? (
            <>
              <Text className="text-mutedForeground mb-4 text-base">
                We are thrilled to inform you that your workshop proposal has
                been accepted! Your session will be a valuable addition to our
                event.
              </Text>
              <Text className="text-mutedForeground mb-6 text-base">
                You will receive further details about scheduling and logistics
                soon. Thank you for your contribution!
              </Text>
            </>
          ) : (
            <>
              <Text className="text-mutedForeground mb-4 text-base">
                We appreciate your interest in presenting a workshop at our
                event. Unfortunately, your proposal was not selected this time.
              </Text>
              <Text className="text-mutedForeground mb-6 text-base">
                We encourage you to apply for future events. Thank you for your
                understanding.
              </Text>
            </>
          )}
        </Section>

        <Hr className="border-border my-6" />

        <Section className="text-center">
          <Button
            className="bg-primary rounded-lg px-8 py-3 font-semibold text-white"
            href={viewUrl}
          >
            View My Applications
          </Button>

          <Text className="text-mutedForeground mt-6 text-sm">
            Thank you for being part of Eventifive.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}

export default WorkshopStatusEmail;
