"use client";

import { Label } from "@/components/ui/label";
import { Uploader, type ExistingImage } from "@/components/uploader";
import { Image as ImageIcon, Loader2 } from "lucide-react";

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
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <ImageIcon className="size-4" />
        Event Images (cover + gallery)
      </Label>

      {isLoadingImages ? (
        <div className="border-border flex items-center justify-center rounded-3xl border-2 border-dashed p-8">
          <div className="text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading existing images...</span>
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
        <p className="text-muted-foreground text-xs">
          Images have already been uploaded for this event.
        </p>
      )}
    </div>
  );
}
