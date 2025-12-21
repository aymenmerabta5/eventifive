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
export interface CommitteeReviewsProps {
  eventId: string;
  eventType: string;
}
