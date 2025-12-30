import { Input } from "@/components/ui/input";
import { FileUp, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DropZoneProps } from "../types";

export function DropZone({
  config,
  maxFiles,
  multiple,
  isDragOver,
  disabled,
  isEventImage,
  onFileChange,
  onDrop,
  onDragOver,
  onDragLeave,
}: DropZoneProps) {
  const Icon = isEventImage ? ImageIcon : FileUp;

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 transition-all",
        isDragOver
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
      )}
    >
      <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground h-6 w-6" />
      </div>
      <p className="mt-4 text-sm font-medium">Drag and drop your file here</p>
      <p className="text-muted-foreground mt-1 text-xs">
        or click to browse (max {maxFiles} file(s))
      </p>
      <Input
        id="file"
        name="file"
        type="file"
        multiple={multiple}
        accept={config.accept}
        onChange={onFileChange}
        disabled={disabled}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
      <p className="text-muted-foreground mt-4 text-xs">{config.hint}</p>
    </div>
  );
}
