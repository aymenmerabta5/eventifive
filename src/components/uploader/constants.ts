import type { RoleConfig } from "./types";

export const ROLE_CONFIG: Record<"registration_document" | "event_image", RoleConfig> = {
  registration_document: {
    label: "Supporting document",
    accept:
      ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    multiple: true,
    uploadUrl: "/api/submit-documents",
    maxFilesDefault: 3,
    hint: "PDF, DOC, DOCX up to 10MB each",
  },
  event_image: {
    label: "Event image",
    accept: "image/jpeg,image/jpg,image/png,image/webp,image/gif",
    multiple: true,
    uploadUrl: "/api/upload-image",
    maxFilesDefault: 4,
    hint: "JPEG, PNG, WebP, GIF up to 10MB each",
  },
} as const;
