// Workshop form props
export interface WorkshopFormProps {
  eventId: string;
  eventType: string;
}

// Form submission data
export interface WorkshopSubmissionData {
  name: string;
  email: string;
  researchDomain: string;
  aboutIdea: string;
  files: File[];
}

// Form state
export interface WorkshopFormState {
  name: string;
  email: string;
  researchDomain: string;
  aboutIdea: string;
  files: File[];
  uploadedCount: number;
  isLoadingQuota: boolean;
  isSubmitting: boolean;
  isDragOver: boolean;
  submissionId: string | null;
}

// Upload quota response
export interface UploadQuotaResponse {
  uploadedCount?: number;
  maxFiles?: number;
  message?: string;
}

// Upload response
export interface UploadResponse {
  message?: string;
  fileId?: string;
  documentKey?: string;
  submissionId?: string;
}
