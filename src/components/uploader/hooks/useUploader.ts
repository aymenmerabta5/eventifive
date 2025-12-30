"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  type ChangeEvent,
} from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { ROLE_CONFIG } from "../constants";
import { getFileKey } from "../utils";
import { usePreviewUrls } from "./usePreviewUrls";
import { useUploadQuota } from "./useUploadQuota";
import { useFileDragDrop } from "./useFileDragDrop";
import { useImageReorder } from "./useImageReorder";
import type {
  UploaderProps,
  ExistingImage,
  UnifiedImageItem,
  UploadedImage,
} from "../types";

export function useUploader(props: UploaderProps) {
  const config = ROLE_CONFIG[props.role];
  const mode = props.mode ?? "upload";
  const { data: session } = authClient.useSession();
  const user = session?.user ?? null;

  const quotaEventId =
    props.role === "registration_document" ? props.eventId : null;
  const isStagedEventImage = props.role === "event_image" && !props.eventId;
  const isEventImage = props.role === "event_image";

  // Core file state
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [removedExistingIds, setRemovedExistingIds] = useState<Set<string>>(
    new Set(),
  );
  const [isUploading, setIsUploading] = useState(false);

  // Resolved max files based on role and kind
  const resolvedMaxFiles =
    props.role === "event_image"
      ? props.kind === "cover"
        ? 1
        : config.maxFilesDefault
      : config.maxFilesDefault;

  const resolvedMultiple =
    props.role === "event_image" ? props.kind === "gallery" : config.multiple;

  // Use upload quota hook
  const {
    uploadedCount,
    maxFiles,
    setMaxFiles,
    isLoadingQuota,
    incrementUploadedCount,
  } = useUploadQuota({
    role: props.role,
    eventId: quotaEventId,
    userId: user?.id,
  });

  // Sync maxFiles when resolvedMaxFiles changes
  useEffect(() => {
    setMaxFiles(resolvedMaxFiles);
  }, [resolvedMaxFiles, setMaxFiles]);

  // Computed values
  const activeExistingImages = useMemo(() => {
    return (props.initialImages ?? []).filter(
      (img) => !removedExistingIds.has(img.fileId),
    );
  }, [props.initialImages, removedExistingIds]);

  const remainingSlots = Math.max(
    0,
    maxFiles - activeExistingImages.length - uploadedCount - files.length,
  );
  const addMoreFiles = remainingSlots > 0;

  // Preview URLs hook
  const { previewUrls, revokeUrl, clearAllUrls } = usePreviewUrls({
    files,
    uploadedImages,
    isEventImage,
  });

  // File drag/drop hook
  const addFiles = useCallback(
    (incoming: File[]) => {
      if (incoming.length === 0) return;

      setFiles((prev) => {
        const available = Math.max(
          0,
          maxFiles - activeExistingImages.length - uploadedCount - prev.length,
        );
        if (available <= 0) return prev;

        const next = [...prev, ...incoming.slice(0, available)];
        if (incoming.length > available) {
          toast.error(`You can upload a maximum of ${maxFiles} file(s).`);
        }
        return next;
      });
    },
    [maxFiles, activeExistingImages.length, uploadedCount],
  );

  const { isDragOver, handleDragOver, handleDragLeave, handleFileDrop } =
    useFileDragDrop({
      maxFiles,
      canAddMore: addMoreFiles,
      onAddFiles: addFiles,
    });

  // Image reorder hook
  const {
    draggedIndex,
    dragOverIndex,
    imageOrder,
    handleImageDragStart,
    handleImageDragOver,
    handleImageDrop,
    handleImageDragEnd,
  } = useImageReorder({
    initialImages: props.initialImages,
    removedExistingIds,
    files,
    onReorder: props.onReorder,
  });

  // Notify parent of file changes in select mode
  useEffect(() => {
    if (mode !== "select") return;
    props.onFilesChange?.(files);
  }, [files, mode, props]);

  // File handlers
  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!addMoreFiles) {
        toast.error(`You can upload a maximum of ${maxFiles} file(s).`);
        event.target.value = "";
        return;
      }

      const selected = Array.from(event.target.files ?? []);
      addFiles(selected);
      event.target.value = "";
    },
    [addMoreFiles, maxFiles, addFiles],
  );

  const removeFileAt = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeExistingImage = useCallback(
    (fileId: string) => {
      setRemovedExistingIds((prev) => new Set([...prev, fileId]));
      props.onRemoveExistingImage?.(fileId);
    },
    [props],
  );

  const removeUploadedKey = useCallback(
    (key: string) => {
      setUploadedImages((prev) => prev.filter((k) => k.key !== key));
      revokeUrl(key);
    },
    [revokeUrl],
  );

  const clearAll = useCallback(() => {
    setFiles([]);
    setUploadedImages([]);
    setRemovedExistingIds(new Set());
    clearAllUrls();
  }, [clearAllUrls]);

  // Upload function
  const upload = useCallback(async () => {
    if (!user) {
      toast.error("You must be logged in to upload.");
      return;
    }
    if (files.length === 0) {
      toast.error("Please select at least 1 file.");
      return;
    }
    if (props.role === "registration_document" && !props.eventId) {
      toast.error("Missing eventId for document upload.");
      return;
    }
    if (uploadedCount + files.length > maxFiles) {
      toast.error(`You can upload a maximum of ${maxFiles} file(s).`);
      return;
    }

    setIsUploading(true);
    try {
      const results: unknown[] = [];
      const sendMetaOnlyOnce =
        props.role === "registration_document"
          ? (props.sendMetadataOnFirstFileOnly ?? true)
          : false;

      for (const [index, file] of files.entries()) {
        const formData = new FormData();
        formData.set("file", file);

        if (props.role === "registration_document") {
          formData.set("eventId", props.eventId);
          if (!sendMetaOnlyOnce || index === 0) {
            if (props.metadata?.name) formData.set("name", props.metadata.name);
            if (props.metadata?.researchDomain) {
              formData.set("researchDomain", props.metadata.researchDomain);
            }
          }
        }
        if (props.role === "event_image") {
          if (props.eventId) {
            formData.set("target", "event");
            formData.set("eventId", props.eventId);
          } else {
            formData.set("target", "event_staged");
          }
          formData.set("kind", props.kind);
        }

        const res = await fetch(config.uploadUrl, {
          method: "POST",
          body: formData,
        });
        const json = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        if (!res.ok) {
          throw new Error(json.message || "Upload failed.");
        }
        results.push(json);
      }

      toast.success("Upload completed.");
      if (props.role === "event_image") {
        const next = files.map((file) => ({
          key: getFileKey(file),
          size: file.size,
        }));
        setUploadedImages((prev) => {
          const byKey = new Map(prev.map((p) => [p.key, p]));
          for (const item of next) byKey.set(item.key, item);
          return Array.from(byKey.values());
        });
        setFiles([]);
      } else {
        setFiles([]);
      }
      if (props.role === "registration_document") {
        incrementUploadedCount(files.length);
      }
      props.onComplete?.(results);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }, [
    user,
    files,
    props,
    uploadedCount,
    maxFiles,
    config.uploadUrl,
    incrementUploadedCount,
  ]);

  // Build unified items list
  const unifiedItems = useMemo((): UnifiedImageItem[] => {
    const items: UnifiedImageItem[] = [];

    if (imageOrder.length > 0) {
      for (const orderItem of imageOrder) {
        if (orderItem.type === "existing") {
          const existing = activeExistingImages.find(
            (img) => img.fileId === orderItem.id,
          );
          if (existing) {
            items.push({
              type: "existing",
              fileId: existing.fileId,
              url: existing.url,
              fileName: existing.fileName,
              fileSize: existing.fileSize,
            });
          }
        } else {
          const file = files.find((f) => getFileKey(f) === orderItem.id);
          if (file) {
            const key = getFileKey(file);
            const url = previewUrls[key];
            if (url) {
              items.push({ type: "new", key, file, url });
            }
          }
        }
      }
      return items;
    }

    for (const img of activeExistingImages) {
      items.push({
        type: "existing",
        fileId: img.fileId,
        url: img.url,
        fileName: img.fileName,
        fileSize: img.fileSize,
      });
    }

    for (const img of uploadedImages) {
      const url = previewUrls[img.key];
      if (url) {
        const file = files.find((f) => getFileKey(f) === img.key);
        if (file) {
          items.push({ type: "new", key: img.key, file, url });
        }
      }
    }

    for (const file of files) {
      const key = getFileKey(file);
      const url = previewUrls[key];
      if (url && !uploadedImages.some((u) => u.key === key)) {
        items.push({ type: "new", key, file, url });
      }
    }

    return items;
  }, [imageOrder, activeExistingImages, uploadedImages, files, previewUrls]);

  const hasItems = unifiedItems.length > 0 || files.length > 0;

  return {
    // Config and mode
    config,
    mode,
    user,
    isEventImage,
    isStagedEventImage,
    resolvedMultiple,

    // State
    files,
    maxFiles,
    uploadedCount,
    isLoadingQuota,
    isUploading,
    isDragOver,

    // Computed
    activeExistingImages,
    remainingSlots,
    addMoreFiles,
    hasItems,
    unifiedItems,

    // Drag/drop for file zone
    handleDragOver,
    handleDragLeave,
    handleFileDrop,

    // File handlers
    handleFileChange,
    removeFileAt,
    removeExistingImage,
    removeUploadedKey,
    clearAll,

    // Image reorder
    draggedIndex,
    dragOverIndex,
    handleImageDragStart,
    handleImageDragOver,
    handleImageDrop,
    handleImageDragEnd,

    // Upload
    upload,
  };
}
