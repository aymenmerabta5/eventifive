import type { SubmissionType } from "@/server/db/schema/enums";

// Form props
export interface SubmissionFormProps {
  eventId: string;
  eventTitle: string;
}

// Submission types
export type SubmissionTypeValue = "oral" | "poster" | "displayed_paper";

// Form state
export interface SubmissionFormState {
  title: string;
  abstract: string;
  keywords: string;
  submissionType: SubmissionTypeValue;
  name: string;
  email: string;
  files: File[];
  hasSubmitted: boolean;
  existingSubmission: ExistingSubmission | null;
  isCheckingStatus: boolean;
  isSubmitting: boolean;
  isDragOver: boolean;
}

// Existing submission info from GET endpoint
export interface ExistingSubmission {
  id: string;
  title: string;
  status: string;
  submittedAt: string | null;
}

// GET response
export interface SubmissionStatusResponse {
  hasSubmitted: boolean;
  submission: ExistingSubmission | null;
  message?: string;
}

// POST response
export interface SubmissionResponse {
  message?: string;
  submissionId?: string;
  fileId?: string;
  documentKey?: string;
}

// Submission type option for dropdown
export interface SubmissionTypeOption {
  value: SubmissionTypeValue;
  label: string;
  description: string;
}

export const SUBMISSION_TYPE_OPTIONS: SubmissionTypeOption[] = [
  {
    value: "oral",
    label: "Oral Presentation",
    description: "Present your research in a live session",
  },
  {
    value: "poster",
    label: "Poster",
    description: "Display your research on a poster",
  },
  {
    value: "displayed_paper",
    label: "Displayed Paper",
    description: "Submit a paper for display",
  },
];

// Validation constants
export const MAX_TITLE_LENGTH = 500;
export const MAX_ABSTRACT_LENGTH = 5000;
export const MAX_KEYWORDS_LENGTH = 500;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const ALLOWED_FILE_EXTENSIONS = ".pdf,.doc,.docx";
