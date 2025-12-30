import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AddMoreSlotProps } from "../types";

export function AddMoreSlot({
  maxFiles,
  config,
  multiple,
  disabled,
  isImage = false,
  onFileChange,
}: AddMoreSlotProps) {
  if (isImage) {
    return (
      <div className="border-border bg-background/40 text-muted-foreground hover:bg-muted/20 relative flex aspect-square w-full items-center justify-center rounded-2xl border border-dashed text-xs transition-colors">
        <span>Add more (up to {maxFiles})</span>
        <Input
          id="file-more"
          name="file-more"
          type="file"
          multiple={multiple}
          accept={config.accept}
          onChange={onFileChange}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    );
  }

  return (
    <div className="border-border text-muted-foreground relative flex items-center justify-center rounded-lg border border-dashed p-3 text-xs">
      <span>Add more (up to {maxFiles})</span>
      <Input
        id="file-more"
        name="file-more"
        type="file"
        multiple={multiple}
        accept={config.accept}
        onChange={onFileChange}
        disabled={disabled}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}
