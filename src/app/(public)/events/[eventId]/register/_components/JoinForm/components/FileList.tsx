import type { ChangeEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, X } from "lucide-react";
import { ACCEPTED_FILE_TYPES } from "../constants";

interface FileListProps {
  files: File[];
  canAddMore: boolean;
  onRemoveFile: (index: number) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function FileList({
  files,
  canAddMore,
  onRemoveFile,
  onFileChange,
}: FileListProps) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="space-y-3 p-4">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${file.size}-${index}`}
            className="flex items-center gap-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onRemoveFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {canAddMore ? (
          <div className="relative flex items-center justify-center rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
            <span>Add more files (up to 3)</span>
            <Input
              id="file-more"
              name="file-more"
              type="file"
              multiple
              accept={ACCEPTED_FILE_TYPES}
              onChange={onFileChange}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
