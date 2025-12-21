import type { ChangeEvent, DragEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileUp, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES_STRING, MAX_FILES } from "../constants";

interface FileUploadAreaProps {
  files: File[];
  uploadedCount: number;
  isLoadingQuota: boolean;
  isDragOver: boolean;
  canAddMoreFiles: boolean;
  maxFiles: number;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onRemoveFile: (index: number) => void;
}

export function FileUploadArea({
  files,
  uploadedCount,
  isLoadingQuota,
  isDragOver,
  canAddMoreFiles,
  maxFiles,
  onFileChange,
  onDrop,
  onDragOver,
  onDragLeave,
  onRemoveFile,
}: FileUploadAreaProps) {
  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <FileUp className="text-muted-foreground h-4 w-4" />
        Supporting document
      </Label>
      <p className="text-muted-foreground text-xs">
        {isLoadingQuota
          ? "Checking upload limit..."
          : `${uploadedCount}/${maxFiles} already uploaded for this event`}
      </p>

      {files.length === 0 ? (
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
          <p className="mt-4 text-sm font-medium">
            Drag and drop your file here
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            or click to browse from your computer (max {MAX_FILES} files)
          </p>
          <Input
            id="file"
            name="file"
            type="file"
            multiple
            accept={ACCEPTED_FILE_TYPES_STRING}
            onChange={onFileChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <p className="text-muted-foreground mt-4 text-xs">
            PDF, DOC, DOCX up to 10MB each
          </p>
        </div>
      ) : (
        <Card className="bg-muted/30">
          <CardContent className="space-y-3 p-4">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${index}`}
                className="flex items-center gap-4"
              >
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <FileText className="text-primary h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                    onClick={() => onRemoveFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {canAddMoreFiles ? (
              <div className="border-border text-muted-foreground relative flex items-center justify-center rounded-lg border border-dashed p-3 text-xs">
                <span>Add more files (up to {MAX_FILES})</span>
                <Input
                  id="file-more"
                  name="file-more"
                  type="file"
                  multiple
                  accept={ACCEPTED_FILE_TYPES_STRING}
                  onChange={onFileChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
