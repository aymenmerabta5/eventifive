"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { MAX_FILES } from "../constants";
import type {
  PersonalInfo,
  QuotaInfo,
  QuotaResponse,
  UploadResponse,
} from "../types";

export function useJoinForm(eventId: string) {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const user = session?.user;

  // Personal info state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [researchDomain, setResearchDomain] = useState("");

  // File state
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);

  // UI state
  const [isLoadingQuota, setIsLoadingQuota] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // Derived quota info
  const quotaInfo: QuotaInfo = useMemo(
    () => ({
      uploadedCount,
      maxFiles: MAX_FILES,
      remainingSlots: Math.max(0, MAX_FILES - uploadedCount - files.length),
    }),
    [uploadedCount, files.length]
  );

  const canAddMoreFiles = quotaInfo.remainingSlots > 0;

  // Personal info object
  const personalInfo: PersonalInfo = useMemo(
    () => ({
      name,
      email,
      researchDomain,
    }),
    [name, email, researchDomain]
  );

  // Initialize user data
  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setEmail(user.email ?? "");
    setResearchDomain(
      (user as { researchDomain?: string | null }).researchDomain ?? ""
    );
  }, [user]);

  // Fetch upload quota
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setIsLoadingQuota(true);

    fetch(`/api/upload-file?eventId=${encodeURIComponent(eventId)}`)
      .then(async (res) => {
        const json = (await res.json()) as QuotaResponse;
        if (!res.ok)
          throw new Error(json.message || "Failed to load upload quota");
        return json;
      })
      .then((json) => {
        if (cancelled) return;
        setUploadedCount(Number(json.uploadedCount ?? 0));
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
  }, [eventId, user]);

  // File handlers
  const addFiles = useCallback(
    (incoming: File[]) => {
      if (incoming.length === 0) return;

      setFiles((prev) => {
        const available = Math.max(0, MAX_FILES - uploadedCount - prev.length);
        if (available <= 0) return prev;

        const next = [...prev, ...incoming.slice(0, available)];
        if (incoming.length > available) {
          toast.error("You can upload a maximum of 3 files for this event.");
        }
        return next;
      });
    },
    [uploadedCount]
  );

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!canAddMoreFiles) {
        toast.error("You can upload a maximum of 3 files.");
        event.target.value = "";
        return;
      }

      const selected = Array.from(event.target.files ?? []);
      addFiles(selected);
      event.target.value = "";
    },
    [canAddMoreFiles, addFiles]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);
      if (!canAddMoreFiles) {
        toast.error("You can upload a maximum of 3 files.");
        return;
      }

      const dropped = Array.from(event.dataTransfer.files ?? []);
      addFiles(dropped);
    },
    [canAddMoreFiles, addFiles]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(true);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const removeFileAt = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Form submission
  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (name.trim().length === 0) {
        toast.error("Please enter your full name.");
        return;
      }

      if (files.length === 0) {
        toast.error("Please select at least 1 file to upload.");
        return;
      }

      if (!user) {
        toast.error("You must be logged in to submit a registration.");
        return;
      }

      if (uploadedCount + files.length > MAX_FILES) {
        toast.error("You can upload a maximum of 3 files for this event.");
        return;
      }

      setIsSubmitting(true);

      try {
        for (const [index, file] of files.entries()) {
          const formData = new FormData();
          formData.set("file", file);
          formData.set("eventId", eventId);
          if (index === 0) {
            formData.set("name", name);
            formData.set("researchDomain", researchDomain);
          }

          const uploadResponse = await fetch("/api/upload-file", {
            method: "POST",
            body: formData,
          });

          const uploadJson = (await uploadResponse.json()) as UploadResponse;

          if (!uploadResponse.ok) {
            throw new Error(uploadJson.message || "Failed to upload file.");
          }

          // Capture submissionId from the first file upload
          if (index === 0 && uploadJson.submissionId) {
            setSubmissionId(uploadJson.submissionId);
          }
        }

        toast.success("Your registration file has been uploaded successfully.");
        setFiles([]);
        setUploadedCount((prev) => Math.min(MAX_FILES, prev + files.length));
      } catch (error) {
        console.error("Error during registration upload:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while uploading your file."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, files, user, uploadedCount, eventId, researchDomain]
  );

  return {
    // Session state
    user,
    isSessionPending,

    // Personal info
    personalInfo,
    setName,
    setResearchDomain,

    // Files
    files,
    quotaInfo,
    canAddMoreFiles,
    isLoadingQuota,

    // Drag state
    isDragOver,

    // Submission state
    isSubmitting,
    submissionId,

    // Handlers
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    removeFileAt,
    handleSubmit,
  };
}
