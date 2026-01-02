"use client";

import { useEffect, useState } from "react";
import { ROLE_CONFIG } from "../constants";

interface UseUploadQuotaOptions {
  role: "registration_document" | "event_image";
  eventId: string | null;
  userId: string | undefined;
}

export function useUploadQuota({
  role,
  eventId,
  userId,
}: UseUploadQuotaOptions) {
  const [uploadedCount, setUploadedCount] = useState(0);
  const [maxFiles, setMaxFiles] = useState<number>(
    ROLE_CONFIG[role].maxFilesDefault,
  );
  const [isLoadingQuota, setIsLoadingQuota] = useState(false);

  useEffect(() => {
    if (role !== "registration_document") return;
    if (!userId) return;
    if (!eventId) return;

    let cancelled = false;
    setIsLoadingQuota(true);

    fetch(`/api/submit-documents?eventId=${encodeURIComponent(eventId)}`)
      .then(async (res) => {
        const json = (await res.json()) as {
          uploadedCount?: number;
          maxFiles?: number;
          message?: string;
        };
        if (!res.ok) {
          throw new Error(json.message || "Failed to load upload quota");
        }
        return json;
      })
      .then((json) => {
        if (cancelled) return;
        setUploadedCount(Number(json.uploadedCount ?? 0));
        setMaxFiles(Number(json.maxFiles ?? ROLE_CONFIG[role].maxFilesDefault));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error fetching upload quota:", err);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoadingQuota(false);
      });

    return () => {
      cancelled = true;
    };
  }, [role, eventId, userId]);

  const incrementUploadedCount = (count: number) => {
    setUploadedCount((prev) => Math.min(maxFiles, prev + count));
  };

  return {
    uploadedCount,
    maxFiles,
    setMaxFiles,
    isLoadingQuota,
    incrementUploadedCount,
  };
}
