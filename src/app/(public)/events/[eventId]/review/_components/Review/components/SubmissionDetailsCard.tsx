import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Loader2 } from "lucide-react";
import type { SubmissionFile } from "../types";

interface SubmissionDetailsCardProps {
  title: string;
  abstract?: string | null;
  files: SubmissionFile[];
  downloadingFileId: string | null;
  onDownload: (fileId: string, fileName: string) => void;
}

export function SubmissionDetailsCard({
  title,
  abstract,
  files,
  downloadingFileId,
  onDownload,
}: SubmissionDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission Details</CardTitle>
        <CardDescription>Title and associated files</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm font-medium">
            Title
          </Label>
          <p className="text-lg font-semibold">{title}</p>
        </div>

        {abstract && (
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm font-medium">
              Abstract
            </Label>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {abstract}
            </p>
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Files</Label>
          {files.length > 0 ? (
            <div className="space-y-3">
              {files.map((file) => (
                <Card
                  key={file.id}
                  className="bg-muted/30 hover:bg-muted/50 overflow-hidden transition-colors"
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                      <FileText className="text-primary h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {file.fileName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {(file.fileSize / 1024 / 1024).toFixed(2)} MB ·{" "}
                        {file.contentType}
                      </p>
                      {file.purpose && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {file.purpose}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownload(file.id, file.fileName)}
                        disabled={downloadingFileId === file.id}
                      >
                        {downloadingFileId === file.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-4 w-4" />
                        )}
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No files attached to this submission.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
