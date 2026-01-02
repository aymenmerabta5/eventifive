import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Loader2,
  FileType,
  HardDrive,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubmissionFile } from "../types";

interface SubmissionDetailsCardProps {
  title: string;
  abstract?: string | null;
  files: SubmissionFile[];
  downloadingFileId: string | null;
  onDownload: (fileId: string, fileName: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function SubmissionDetailsCard({
  title,
  abstract,
  files,
  downloadingFileId,
  onDownload,
}: SubmissionDetailsCardProps) {
  return (
    <Card className="border-border/60 bg-card/80 relative overflow-hidden backdrop-blur-sm">
      {/* Left accent bar */}
      <div className="from-primary via-primary/80 to-secondary absolute top-0 left-0 h-full w-1 bg-gradient-to-b" />

      <CardHeader className="pl-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="font-display flex items-center gap-2 text-xl tracking-tight">
              <FileText className="text-primary h-5 w-5" />
              Submission Details
            </CardTitle>
            <CardDescription>
              Review the title, abstract, and attached documents
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-muted-foreground">
            {files.length} file{files.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pl-5">
        {/* Title section */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Title
          </p>
          <h2 className="font-display text-foreground text-xl leading-snug font-semibold tracking-tight sm:text-2xl">
            {title}
          </h2>
        </div>

        {/* Abstract section */}
        {abstract && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Abstract
            </p>
            <div className="bg-muted/30 border-border/50 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {abstract}
              </p>
            </div>
          </div>
        )}

        <Separator />

        {/* Files section */}
        <div className="space-y-4">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Attachments
          </p>

          {files.length > 0 ? (
            <div className="grid gap-3">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border transition-all duration-200",
                    "border-border/60 bg-card hover:border-primary/30 hover:shadow-md",
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Subtle hover gradient */}
                  <div className="from-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                  <div className="relative flex items-center gap-4 p-4">
                    {/* File icon */}
                    <div className="bg-primary/10 border-primary/20 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border">
                      <FileText className="text-primary h-6 w-6" />
                    </div>

                    {/* File info */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-foreground truncate font-medium">
                        {file.fileName}
                      </p>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {formatFileSize(file.fileSize)}
                        </span>
                        <span className="bg-border h-3 w-px" />
                        <span className="inline-flex items-center gap-1">
                          <FileType className="h-3 w-3" />
                          {file.contentType}
                        </span>
                      </div>
                      {file.purpose && (
                        <Badge
                          variant="secondary"
                          className="mt-1.5 gap-1 text-xs"
                        >
                          <Tag className="h-3 w-3" />
                          {file.purpose}
                        </Badge>
                      )}
                    </div>

                    {/* Download button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownload(file.id, file.fileName)}
                      disabled={downloadingFileId === file.id}
                      className={cn(
                        "flex-shrink-0 gap-2 transition-all",
                        "hover:border-primary/50 hover:text-primary",
                      )}
                    >
                      {downloadingFileId === file.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="hidden sm:inline">
                            Downloading...
                          </span>
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          <span className="hidden sm:inline">Download</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-border/50 bg-muted/20 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-8 text-center">
              <div className="bg-muted/50 flex h-12 w-12 items-center justify-center rounded-full">
                <FileText className="text-muted-foreground h-6 w-6" />
              </div>
              <p className="text-muted-foreground text-sm">
                No files attached to this submission
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
