// Submission assigned for review
export interface AssignedSubmission {
  id: string;
  title: string;
  submitterName: string | null;
  submitterEmail: string | null;
  submittedAt: Date | null;
  fileCount: number;
}

// Component props
export interface CommunicatorReviewsProps {
  eventId: string;
  eventType: string;
}

// Backwards compatibility alias
export type CommitteeReviewsProps = CommunicatorReviewsProps;
