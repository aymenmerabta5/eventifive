"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { MAX_FILES } from "../constants";
import type { UploadQuotaResponse, UploadResponse } from "../types";

interface UseWorkshopFormProps {
  eventId: string;
}

export function useWorkshopForm({ eventId }: UseWorkshopFormProps) {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const user = session?.user;

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [researchDomain, setResearchDomain] = useState("");
  const [aboutIdea, setAboutIdea] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  // Upload state
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isLoadingQuota, setIsLoadingQuota] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // Derived state
  const remainingSlots = Math.max(0, MAX_FILES - uploadedCount - files.length);
  const canAddMoreFiles = remainingSlots > 0;

  // Sync user data
  useEffect(() => {
    if (!user) return;

    setName(user.name ?? "");
    setEmail(user.email ?? "");
    setResearchDomain(
      (user as { researchDomain?: string | null }).researchDomain ?? "",
    );
    setAboutIdea("");
  }, [user]);

  // Fetch upload quota
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setIsLoadingQuota(true);

    fetch(`/api/submit-documents?eventId=${encodeURIComponent(eventId)}`)
      .then(async (response) => {
        const json = (await response.json()) as UploadQuotaResponse;

        if (!response.ok) {
          throw new Error(json.message || "Failed to load upload quota");
        }

        return json;
      })
      .then((json) => {
        if (cancelled) return;
        setUploadedCount(Number(json.uploadedCount ?? 0));
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Error fetching upload quota:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load your remaining upload slots.",
        );
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoadingQuota(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, user]);

  // Add files helper
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
    [uploadedCount],
  );

  // Handlers
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
    [canAddMoreFiles, addFiles],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);
      if (!canAddMoreFiles) {
        toast.error("You can upload a maximum of 3 files.");
        return;
      }

      const dropped = Array.from(event.dataTransfer.files ?? []);
      addFiles(dropped);
    },
    [canAddMoreFiles, addFiles],
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
  }, []);

  const handleResearchDomainChange = useCallback((value: string) => {
    setResearchDomain(value);
  }, []);

  const handleAboutIdeaChange = useCallback((value: string) => {
    setAboutIdea(value);
  }, []);

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

      if (uploadedCount + files.length > MAX_FILES) {
        toast.error("You can upload a maximum of 3 files for this event.");
        return;
      }

      if (!user) {
        toast.error("You must be logged in to submit a registration.");
        return;
      }

      setIsSubmitting(true);

      try {
        const trimmedAboutIdea = aboutIdea.trim();

        for (const [index, file] of files.entries()) {
          const formData = new FormData();
          formData.set("file", file);
          formData.set("eventId", eventId);
          if (index === 0) {
            formData.set("name", name);
            formData.set("researchDomain", researchDomain);
            if (trimmedAboutIdea.length > 0) {
              formData.set("aboutIdea", trimmedAboutIdea);
            }
          }

          const uploadResponse = await fetch("/api/submit-documents", {
            method: "POST",
            body: formData,
          });

          const uploadJson = (await uploadResponse.json()) as UploadResponse;

          if (!uploadResponse.ok) {
            throw new Error(uploadJson.message || "Failed to upload file.");
          }

          if (index === 0 && uploadJson.submissionId) {
            setSubmissionId(uploadJson.submissionId);
          }
        }

        toast.success(
          "Your workshop application has been uploaded successfully.",
        );
        setFiles([]);
        setUploadedCount((prev) => Math.min(MAX_FILES, prev + files.length));
      } catch (error) {
        console.error("Error during workshop registration upload:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while uploading your file.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, files, uploadedCount, user, aboutIdea, eventId, researchDomain],
  );

  return {
    // Session
    user,
    isAuthenticated: !!user,
    isPending: isSessionPending,

    // Form state
    name,
    email,
    researchDomain,
    aboutIdea,
    files,

    // Upload state
    uploadedCount,
    isLoadingQuota,
    isSubmitting,
    isDragOver,
    submissionId,

    // Derived state
    remainingSlots,
    canAddMoreFiles,
    maxFiles: MAX_FILES,

    // Handlers
    handleNameChange,
    handleResearchDomainChange,
    handleAboutIdeaChange,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleRemoveFile,
    handleSubmit,
  };
}
