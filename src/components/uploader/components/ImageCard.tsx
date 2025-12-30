import { Button } from "@/components/ui/button";
import { GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize } from "../utils";
import type { ImageCardProps } from "../types";

export function ImageCard({
  item,
  index,
  isCover,
  isUploading,
  isDragged,
  isDragOver,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: ImageCardProps) {
  const fileSize = item.type === "existing" ? item.fileSize : item.file.size;

  return (
    <div
      className={cn(
        "space-y-1 transition-transform",
        isDragged && "opacity-50",
        isDragOver && "scale-105",
      )}
      draggable={!isUploading}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <div
        className={cn(
          "bg-muted/30 relative cursor-grab overflow-hidden rounded-2xl border shadow-sm active:cursor-grabbing",
          isCover ? "ring-primary/60 ring-2" : "ring-border/40 ring-1",
        )}
      >
        <img
          src={item.url}
          alt={isCover ? "Cover image preview" : "Event image preview"}
          className="aspect-square w-full object-cover"
          loading="lazy"
          draggable={false}
        />

        <div className="bg-background/85 text-foreground absolute top-2 left-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm">
          <GripVertical className="text-muted-foreground h-3 w-3" />
          <span className="bg-primary/10 text-primary inline-flex h-5 w-5 items-center justify-center rounded-full">
            {index + 1}
          </span>
          {isCover ? <span className="text-primary">Cover</span> : null}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="bg-background/70 text-foreground hover:bg-background hover:text-destructive absolute top-2 right-2 h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          disabled={isUploading}
          aria-label="Remove image"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-muted-foreground text-center text-[11px]">
        {formatFileSize(fileSize)}
        {item.type === "existing" && (
          <span className="text-primary/70 ml-1">(saved)</span>
        )}
      </div>
    </div>
  );
}
