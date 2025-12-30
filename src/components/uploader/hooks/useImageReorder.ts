"use client";

import { useState, useCallback, useEffect, type DragEvent } from "react";
import { getFileKey } from "../utils";
import type { ExistingImage, ImageOrder } from "../types";

interface UseImageReorderOptions {
  initialImages: ExistingImage[] | undefined;
  removedExistingIds: Set<string>;
  files: File[];
  onReorder?: (order: ImageOrder) => void;
}

export function useImageReorder({
  initialImages,
  removedExistingIds,
  files,
  onReorder,
}: UseImageReorderOptions) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [imageOrder, setImageOrder] = useState<ImageOrder>([]);

  // Sync imageOrder with initialImages and files
  useEffect(() => {
    if (!initialImages) return;

    const existingOrder = initialImages
      .filter((img) => !removedExistingIds.has(img.fileId))
      .map((img) => ({ type: "existing" as const, id: img.fileId }));

    const newOrder = files.map((f) => ({
      type: "new" as const,
      id: getFileKey(f),
    }));

    setImageOrder([...existingOrder, ...newOrder]);
  }, [initialImages, removedExistingIds, files]);

  const handleImageDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleImageDragOver = useCallback(
    (e: DragEvent, index: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === index) return;
      setDragOverIndex(index);
    },
    [draggedIndex],
  );

  const handleImageDrop = useCallback(
    (e: DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === dropIndex) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      setImageOrder((prev) => {
        const newOrder = [...prev];
        const draggedItem = newOrder[draggedIndex];
        if (!draggedItem) return prev;
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(dropIndex, 0, draggedItem);
        onReorder?.(newOrder);
        return newOrder;
      });

      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex, onReorder],
  );

  const handleImageDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  return {
    draggedIndex,
    dragOverIndex,
    imageOrder,
    handleImageDragStart,
    handleImageDragOver,
    handleImageDrop,
    handleImageDragEnd,
  };
}
