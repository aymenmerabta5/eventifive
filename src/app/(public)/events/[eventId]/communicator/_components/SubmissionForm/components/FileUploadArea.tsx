import type { ChangeEvent, DragEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FileUp,
  FileText,
  X,
  Cloud,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ALLOWED_FILE_EXTENSIONS } from "../types";

interface FileUploadAreaProps {
  files: File[];
  isDragOver: boolean;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onRemoveFile: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "bg-red-500/10 text-red-500";
  if (ext === "doc" || ext === "docx") return "bg-blue-500/10 text-blue-500";
  return "bg-primary/10 text-primary";
}

export function FileUploadArea({
  files,
  isDragOver,
  onFileChange,
  onDrop,
  onDragOver,
  onDragLeave,
  onRemoveFile,
}: FileUploadAreaProps) {
  const file = files[0];

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-chart-4/20 to-chart-4/5 ring-1 ring-chart-4/10">
          <Cloud className="h-5 w-5 text-chart-4" />
        </div>
        <div>
          <Label className="flex items-center gap-2 text-base font-semibold">
            Paper Document
            <span className="text-destructive">*</span>
            {file && (
              <CheckCircle2 className="h-4 w-4 text-green-500 animate-in zoom-in duration-200" />
            )}
          </Label>
          <p className="text-xs text-muted-foreground">
            Upload your paper in PDF, DOC, or DOCX format (max 10MB)
          </p>
        </div>
      </div>

      {/* Upload zone */}
      {!file ? (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={cn(
            "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-300",
            isDragOver
              ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
              : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
          )}
        >
          {/* Animated background gradient on drag */}
          <div
            className={cn(
              "absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 opacity-0 transition-opacity duration-300",
              isDragOver && "opacity-100"
            )}
          />

          {/* Icon */}
          <div
            className={cn(
              "relative flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
              isDragOver
                ? "bg-primary/20 scale-110"
                : "bg-muted group-hover:bg-primary/10"
            )}
          >
            <FileUp
              className={cn(
                "h-8 w-8 transition-all duration-300",
                isDragOver
                  ? "text-primary scale-110"
                  : "text-muted-foreground group-hover:text-primary"
              )}
            />
          </div>

          {/* Text */}
          <div className="relative mt-5 text-center">
            <p className="text-base font-medium">
              {isDragOver ? (
                <span className="text-primary">Drop your paper here</span>
              ) : (
                "Drag and drop your paper"
              )}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              or{" "}
              <span className="font-medium text-primary cursor-pointer hover:underline">
                browse
              </span>{" "}
              from your computer
            </p>
          </div>

          {/* File input */}
          <Input
            id="file"
            name="file"
            type="file"
            accept={ALLOWED_FILE_EXTENSIONS}
            onChange={onFileChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />

          {/* Supported formats */}
          <div className="relative mt-6 flex flex-wrap items-center justify-center gap-2">
            {["PDF", "DOC", "DOCX"].map((format) => (
              <span
                key={format}
                className="rounded-full border border-border/60 bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                .{format.toLowerCase()}
              </span>
            ))}
            <span className="text-xs text-muted-foreground">
              Up to 10MB
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* File display */}
          <div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-card/50">
            <div className="group flex items-center gap-4 p-4 transition-colors hover:bg-muted/30">
              {/* File icon */}
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  getFileIcon(file.name)
                )}
              >
                <FileText className="h-6 w-6" />
              </div>

              {/* File info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* Remove button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                onClick={onRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Replace file option */}
          <div className="relative">
            <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
              <FileUp className="h-4 w-4" />
              <span>Replace with a different file</span>
            </div>
            <Input
              id="file-replace"
              name="file-replace"
              type="file"
              accept={ALLOWED_FILE_EXTENSIONS}
              onChange={onFileChange}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
        </div>
      )}
    </div>
  );
}
