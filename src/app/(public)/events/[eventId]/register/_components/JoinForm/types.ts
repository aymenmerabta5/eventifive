export interface JoinFormProps {
  eventId: string;
  eventType: string;
}

export interface FileItem {
  file: File;
  id: string;
}

export interface QuotaInfo {
  uploadedCount: number;
  maxFiles: number;
  remainingSlots: number;
}

export interface PersonalInfo {
  name: string;
  email: string;
  researchDomain: string;
}

export interface UploadResponse {
  message?: string;
  fileId?: string;
  documentKey?: string;
  submissionId?: string;
}

export interface QuotaResponse {
  uploadedCount?: number;
  maxFiles?: number;
  message?: string;
}
