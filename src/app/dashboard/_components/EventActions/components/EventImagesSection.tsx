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
        <div className="border-border/60 bg-muted/20 flex items-center justify-center rounded-2xl border-2 border-dashed p-12">
          <div className="text-muted-foreground flex flex-col items-center gap-3">
            <Loader2 className="text-primary size-8 animate-spin" />
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
        <p className="text-muted-foreground mt-3 text-xs">
          Images have already been uploaded for this event.
        </p>
      )}
    </FormSection>
  );
}
