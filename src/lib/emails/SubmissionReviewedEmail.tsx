import { Button, Section, Text, Heading, Hr } from "@react-email/components";
import EmailLayout from "./EmailLayout";

interface ReviewerFeedback {
  reviewerName: string;
  recommendation: "accept" | "reject";
  comment: string | null;
}

interface SubmissionReviewedEmailProps {
  recipientName: string;
  eventTitle: string;
  submissionTitle: string;
  status: "accepted" | "rejected";
  reviewerFeedback: ReviewerFeedback[];
  viewUrl: string;
}

export function SubmissionReviewedEmail({
  recipientName,
  eventTitle,
  submissionTitle,
  status,
  reviewerFeedback,
  viewUrl,
}: SubmissionReviewedEmailProps) {
  const isAccepted = status === "accepted";
  const statusColor = isAccepted ? "#22c55e" : "#ef4444";
  const statusText = isAccepted ? "Accepted" : "Not Accepted";

  return (
    <EmailLayout title={`Submission ${statusText} - Eventifive`}>
      <Section className="bg-card my-6 rounded-lg px-6 py-12">
        <Section className="text-center">
          <Heading as="h1" className="text-primary mb-2 text-2xl font-bold">
            Eventifive
          </Heading>
          <Heading as="h2" className="text-foreground mb-4 text-3xl font-bold">
            {isAccepted ? "Congratulations!" : "Submission Update"}
          </Heading>
          <Text className="text-mutedForeground mb-6 text-base">
            Hi {recipientName}, your submission has been reviewed by our panel.
          </Text>

          <Section className="bg-muted mb-6 rounded-lg p-4">
            <Text className="text-foreground text-lg font-semibold">
              {submissionTitle}
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
            <Text className="text-mutedForeground mb-6 text-base">
              We are pleased to inform you that your submission has been
              accepted. Congratulations on this achievement!
            </Text>
          ) : (
            <Text className="text-mutedForeground mb-6 text-base">
              We regret to inform you that your submission was not accepted this
              time. Please review the feedback below from our reviewers.
            </Text>
          )}
        </Section>

        <Hr className="border-border my-6" />

        <Section className="text-left">
          <Heading as="h3" className="text-foreground mb-4 text-xl font-bold">
            Reviewer Feedback
          </Heading>

          {reviewerFeedback.map((feedback, index) => (
            <Section key={index} className="bg-muted mb-4 rounded-lg p-4">
              <Text className="text-foreground mb-2 font-semibold">
                Reviewer {index + 1}
                <span
                  style={{
                    marginLeft: "8px",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    backgroundColor:
                      feedback.recommendation === "accept"
                        ? "#dcfce7"
                        : "#fee2e2",
                    color:
                      feedback.recommendation === "accept"
                        ? "#166534"
                        : "#991b1b",
                  }}
                >
                  {feedback.recommendation === "accept" ? "Accept" : "Reject"}
                </span>
              </Text>
              <Text className="text-mutedForeground text-sm">
                {feedback.comment || "No comment provided."}
              </Text>
            </Section>
          ))}
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
            Thank you for your participation in Eventifive.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}

export default SubmissionReviewedEmail;
