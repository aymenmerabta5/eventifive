import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { UploaderActionsProps } from "../types";

export function UploaderActions({
  mode,
  isUploading,
  disabled,
  isEventImage,
  onClear,
  onUpload,
}: UploaderActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <Button
        type="button"
        variant="secondary"
        onClick={onClear}
        disabled={isUploading}
      >
        Clear
      </Button>
      {mode === "upload" ? (
        <Button type="button" onClick={onUpload} disabled={disabled || isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            "Upload"
          )}
        </Button>
      ) : null}
    </div>
  );
}
