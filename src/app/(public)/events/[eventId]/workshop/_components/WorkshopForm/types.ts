// Workshop form props
export interface WorkshopFormProps {
  eventId: string;
  eventType?: string;
}

// Form submission data
export interface WorkshopSubmissionData {
  workshopTitle: string;
  name: string;
  email: string;
  researchDomain: string;
  description: string;
  capacity?: number;
  files: File[];
}

// Form state
export interface WorkshopFormState {
  workshopTitle: string;
  name: string;
  email: string;
  researchDomain: string;
  description: string;
  capacity: string;
  files: File[];
  uploadedCount: number;
  isLoadingQuota: boolean;
  isSubmitting: boolean;
  isDragOver: boolean;
  workshopId: string | null;
}

// Upload quota response
export interface UploadQuotaResponse {
  hasExistingProposal?: boolean;
  existingProposal?: {
    id: string;
    title: string;
    status: string;
    submittedAt: Date | null;
  };
  uploadedCount?: number;
  maxFiles?: number;
  message?: string;
}

// Upload response
export interface UploadResponse {
  message?: string;
  fileId?: string;
  documentKey?: string;
  workshopId?: string;
}
