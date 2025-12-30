"use client";

import { useEffect, useRef, useState } from "react";
import { getFileKey } from "../utils";
import type { UploadedImage } from "../types";

interface UsePreviewUrlsOptions {
  files: File[];
  uploadedImages: UploadedImage[];
  isEventImage: boolean;
}

export function usePreviewUrls({
  files,
  uploadedImages,
  isEventImage,
}: UsePreviewUrlsOptions) {
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const previewUrlsRef = useRef<Record<string, string>>({});

  // Create and manage preview URLs
  useEffect(() => {
    if (!isEventImage) return;

    const selectedKeys = new Set(files.map((f) => getFileKey(f)));
    const uploadedKeys = new Set(uploadedImages.map((i) => i.key));

    setPreviewUrls((prev) => {
      const next: Record<string, string> = { ...prev };

      // Create URLs for new files
      for (const file of files) {
        const key = getFileKey(file);
        next[key] = next[key] ?? URL.createObjectURL(file);
      }

      // Revoke URLs for removed files
      for (const [key, url] of Object.entries(prev)) {
        if (!selectedKeys.has(key) && !uploadedKeys.has(key)) {
          URL.revokeObjectURL(url);
          delete next[key];
        }
      }

      return next;
    });
  }, [files, isEventImage, uploadedImages]);

  // Keep ref in sync for cleanup
  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const url of Object.values(previewUrlsRef.current)) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  const revokeUrl = (key: string) => {
    setPreviewUrls((prev) => {
      const url = prev[key];
      if (!url) return prev;
      URL.revokeObjectURL(url);
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const clearAllUrls = () => {
    setPreviewUrls((prev) => {
      for (const url of Object.values(prev)) {
        URL.revokeObjectURL(url);
      }
      return {};
    });
  };

  return {
    previewUrls,
    revokeUrl,
    clearAllUrls,
  };
}
