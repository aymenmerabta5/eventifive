import { ImageCard } from "./ImageCard";
import { AddMoreSlot } from "./AddMoreSlot";
import { getFileKey } from "../utils";
import type { ImageGridProps } from "../types";

export function ImageGrid({
  items,
  maxFiles,
  addMoreFiles,
  config,
  multiple,
  isUploading,
  disabled,
  draggedIndex,
  dragOverIndex,
  onRemoveExisting,
  onRemoveNew,
  onFileChange,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  files,
}: ImageGridProps) {
  return (
    <div className="flex w-full justify-center">
      <div className="grid w-fit grid-cols-[repeat(3,110px)] gap-6 sm:grid-cols-[repeat(4,140px)] md:grid-cols-[repeat(4,180px)]">
        {items.map((item, displayIndex) => {
          const isCover = displayIndex === 0;
          const itemKey = item.type === "existing" ? item.fileId : item.key;

          return (
            <ImageCard
              key={`${item.type}-${itemKey}`}
              item={item}
              index={displayIndex}
              isCover={isCover}
              isUploading={isUploading}
              isDragged={draggedIndex === displayIndex}
              isDragOver={dragOverIndex === displayIndex}
              onRemove={() => {
                if (item.type === "existing") {
                  onRemoveExisting(item.fileId);
                } else {
                  const originalIndex = files.findIndex(
                    (f) => getFileKey(f) === item.key,
                  );
                  if (originalIndex >= 0) {
                    onRemoveNew(originalIndex);
                  }
                }
              }}
              onDragStart={() => onDragStart(displayIndex)}
              onDragOver={(e) => onDragOver(e, displayIndex)}
              onDrop={(e) => onDrop(e, displayIndex)}
              onDragEnd={onDragEnd}
            />
          );
        })}

        {addMoreFiles ? (
          <AddMoreSlot
            maxFiles={maxFiles}
            config={config}
            multiple={multiple}
            disabled={disabled || isUploading}
            isImage
            onFileChange={onFileChange}
          />
        ) : null}
      </div>
    </div>
  );
}
