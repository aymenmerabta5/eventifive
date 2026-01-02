import type { IconCheck } from "@tabler/icons-react";

// Application status types
export type SubmissionStatus = "draft" | "accepted" | "rejected";
export type WorkshopStatus = "pending" | "accepted" | "rejected";
export type ApplicationStatus = SubmissionStatus | WorkshopStatus;

// Event info shared by both application types
export interface ApplicationEvent {
  id: string;
  title: string;
  type: string;
  startDate: Date;
  endDate: Date;
}

// Reviewer feedback for submissions
export interface ReviewerFeedback {
  recommendation: "accept" | "reject" | null;
  comment: string | null;
}

// Submission application type
export interface SubmissionApplication {
  id: string;
  type: "submission";
  title: string;
  abstract: string | null;
  submissionType: "oral" | "poster" | "displayed_paper";
  status: SubmissionStatus;
  submittedAt: Date | null;
  updatedAt: Date;
  event: ApplicationEvent;
  reviewerFeedback: ReviewerFeedback[] | null;
}

// Workshop application type
export interface WorkshopApplication {
  id: string;
  type: "workshop";
  title: string;
  description: string | null;
  researchDomain: string | null;
  status: WorkshopStatus;
  proposedAt: Date;
  respondedAt: Date | null;
  rejectionReason: string | null;
  event: ApplicationEvent;
}

// Union type for all applications
export type Application = SubmissionApplication | WorkshopApplication;

// Grouped applications by status
export interface GroupedApplications {
  accepted: Application[];
  pending: Application[];
  rejected: Application[];
}

// Application stats
export interface ApplicationStats {
  total: number;
  accepted: number;
  pending: number;
  rejected: number;
}

// Status configuration type
export interface StatusConfig {
  label: string;
  icon: typeof IconCheck;
  className: string;
}
