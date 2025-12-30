import type { DragEvent, ChangeEvent } from "react";

export interface ExistingImage {
  fileId: string;
  url: string;
  fileName: string;
  fileSize: number;
  isDefault: boolean;
}

export type RegistrationDocumentRole = {
  role: "registration_document";
  eventId: string;
  metadata?: {
    name?: string;
    researchDomain?: string;
  };
  sendMetadataOnFirstFileOnly?: boolean;
};

export type EventImageRole = {
  role: "event_image";
  eventId?: string;
  kind: "cover" | "gallery";
};

export type UploaderProps = (RegistrationDocumentRole | EventImageRole) & {
  onComplete?: (results: unknown[]) => void;
  mode?: "upload" | "select";
  onFilesChange?: (files: File[]) => void;
  hintOverride?: string;
  disabled?: boolean;
  initialImages?: ExistingImage[];
  onRemoveExistingImage?: (fileId: string) => void;
  onReorder?: (order: Array<{ type: "existing" | "new"; id: string }>) => void;
};

export type UnifiedImageItem =
  | {
      type: "existing";
      fileId: string;
      url: string;
      fileName: string;
      fileSize: number;
    }
  | { type: "new"; key: string; file: File; url: string };

export interface RoleConfig {
  label: string;
  accept: string;
  multiple: boolean;
  uploadUrl: string;
  maxFilesDefault: number;
  hint: string;
}

export type ImageOrder = Array<{ type: "existing" | "new"; id: string }>;

export interface UploadedImage {
  key: string;
  size: number;
}

// Component prop types
export interface DropZoneProps {
  config: RoleConfig;
  maxFiles: number;
  multiple: boolean;
  isDragOver: boolean;
  disabled: boolean;
  isEventImage: boolean;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
}

export interface ImageCardProps {
  item: UnifiedImageItem;
  index: number;
  isCover: boolean;
  isUploading: boolean;
  isDragged: boolean;
  isDragOver: boolean;
  onRemove: () => void;
  onDragStart: () => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onDragEnd: () => void;
}

export interface ImageGridProps {
  items: UnifiedImageItem[];
  maxFiles: number;
  addMoreFiles: boolean;
  config: RoleConfig;
  multiple: boolean;
  isUploading: boolean;
  disabled: boolean;
  draggedIndex: number | null;
  dragOverIndex: number | null;
  onRemoveExisting: (fileId: string) => void;
  onRemoveNew: (index: number) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: DragEvent, index: number) => void;
  onDrop: (e: DragEvent, index: number) => void;
  onDragEnd: () => void;
  files: File[];
}

export interface FileItemProps {
  file: File;
  index: number;
  isUploading: boolean;
  onRemove: () => void;
}

export interface FileListProps {
  files: File[];
  isUploading: boolean;
  onRemove: (index: number) => void;
}

export interface AddMoreSlotProps {
  maxFiles: number;
  config: RoleConfig;
  multiple: boolean;
  disabled: boolean;
  isImage?: boolean;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export interface UploaderActionsProps {
  mode: "upload" | "select";
  isUploading: boolean;
  disabled: boolean;
  isEventImage: boolean;
  onClear: () => void;
  onUpload: () => void;
}
