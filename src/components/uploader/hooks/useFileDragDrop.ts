"use client";

import { useState, useCallback, type DragEvent } from "react";
import { toast } from "sonner";

interface UseFileDragDropOptions {
  maxFiles: number;
  canAddMore: boolean;
  onAddFiles: (files: File[]) => void;
}

export function useFileDragDrop({
  maxFiles,
  canAddMore,
  onAddFiles,
}: UseFileDragDropOptions) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);

      if (!canAddMore) {
        toast.error(`You can upload a maximum of ${maxFiles} file(s).`);
        return;
      }

      const dropped = Array.from(event.dataTransfer.files ?? []);
      onAddFiles(dropped);
    },
    [canAddMore, maxFiles, onAddFiles],
  );

  return {
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleFileDrop,
  };
}
