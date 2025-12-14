"use client";

import { Label } from "@/components/ui/label";
import { Uploader } from "@/components/uploader";
import { Image as ImageIcon } from "lucide-react";

interface EventImagesSectionProps {
  disabled?: boolean;
  onFilesChange: (files: File[]) => void;
}

export function EventImagesSection({
  disabled = false,
  onFilesChange,
}: EventImagesSectionProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <ImageIcon className="size-4" />
        Event Images (cover + gallery)
      </Label>
      <Uploader
        role="event_image"
        kind="gallery"
        mode="select"
        disabled={disabled}
        onFilesChange={onFilesChange}
      />
      {disabled && (
        <p className="text-muted-foreground text-xs">
          Images have already been uploaded for this event.
        </p>
      )}
    </div>
  );
}
