import { Button } from "@/components/ui/button";
import { FileText, X } from "lucide-react";
import { formatFileSize } from "../utils";
import type { FileItemProps } from "../types";

export function FileItem({ file, isUploading, onRemove }: FileItemProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
        <FileText className="text-primary h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-muted-foreground text-xs">
          {formatFileSize(file.size)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive h-8 w-8"
          onClick={onRemove}
          disabled={isUploading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
