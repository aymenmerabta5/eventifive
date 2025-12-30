"use client";

import { Uploader, type ExistingImage } from "@/components/uploader";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { FormSection } from "./FormSection";

interface EventImagesSectionProps {
  disabled?: boolean;
  onFilesChange: (files: File[]) => void;
  // For update mode
  existingImages?: ExistingImage[];
  isLoadingImages?: boolean;
  onRemoveExistingImage?: (fileId: string) => void;
}

export function EventImagesSection({
  disabled = false,
  onFilesChange,
  existingImages,
  isLoadingImages = false,
  onRemoveExistingImage,
}: EventImagesSectionProps) {
  const hasExistingImages = existingImages && existingImages.length > 0;

  return (
    <FormSection
      icon={<ImageIcon className="size-5" />}
      title="Event Images"
      description="Upload a cover image and gallery photos for your event"
    >
      {isLoadingImages ? (
        <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 p-12">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="text-sm">Loading existing images...</span>
          </div>
        </div>
      ) : (
        <Uploader
          role="event_image"
          kind="gallery"
          mode="select"
          disabled={disabled}
          onFilesChange={onFilesChange}
          initialImages={existingImages}
          onRemoveExistingImage={onRemoveExistingImage}
        />
      )}

      {disabled && !hasExistingImages && (
        <p className="mt-3 text-xs text-muted-foreground">
          Images have already been uploaded for this event.
        </p>
      )}
    </FormSection>
  );
}
