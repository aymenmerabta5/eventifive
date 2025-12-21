import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES } from "../constants";

interface FileUploadAreaProps {
  isDragOver: boolean;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function FileUploadArea({
  isDragOver,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileChange,
}: FileUploadAreaProps) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all",
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
      )}
    >
      <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
        <FileUp className="text-muted-foreground h-6 w-6" />
      </div>
      <p className="mt-4 text-sm font-medium">Drag and drop your file here</p>
      <p className="text-muted-foreground mt-1 text-xs">
        or click to browse from your computer (max 3 files)
      </p>
      <Input
        id="file"
        name="file"
        type="file"
        multiple
        accept={ACCEPTED_FILE_TYPES}
        onChange={onFileChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
      <p className="text-muted-foreground mt-4 text-xs">
        PDF, DOC, DOCX up to 10MB each
      </p>
    </div>
  );
}
