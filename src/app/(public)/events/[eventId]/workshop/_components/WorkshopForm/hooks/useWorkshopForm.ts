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
  const [workshopTitle, setWorkshopTitle] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [researchDomain, setResearchDomain] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  // Upload state
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isLoadingQuota, setIsLoadingQuota] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [workshopId, setWorkshopId] = useState<string | null>(null);

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
    setDescription("");
    setWorkshopTitle("");
    setCapacity("");
  }, [user]);

  // Fetch upload quota
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setIsLoadingQuota(true);

    fetch(`/api/submit-workshop?eventId=${encodeURIComponent(eventId)}`)
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

  const handleDescriptionChange = useCallback((value: string) => {
    setDescription(value);
  }, []);

  const handleWorkshopTitleChange = useCallback((value: string) => {
    setWorkshopTitle(value);
  }, []);

  const handleCapacityChange = useCallback((value: string) => {
    setCapacity(value);
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (workshopTitle.trim().length === 0) {
        toast.error("Please enter a workshop title.");
        return;
      }

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
        toast.error("You must be logged in to submit a proposal.");
        return;
      }

      setIsSubmitting(true);

      try {
        // Submit all files with the workshop proposal
        if (files.length === 0) {
          throw new Error("No files selected");
        }

        const formData = new FormData();
        // Append all files
        files.forEach((file) => {
          formData.append("file", file);
        });
        formData.set("eventId", eventId);
        formData.set("title", workshopTitle.trim());
        formData.set("description", description.trim());
        formData.set("researchDomain", researchDomain.trim());
        if (capacity.trim()) {
          formData.set("capacity", capacity.trim());
        }

        const uploadResponse = await fetch("/api/submit-workshop", {
          method: "POST",
          body: formData,
        });

        const uploadJson = (await uploadResponse.json()) as UploadResponse;

        if (!uploadResponse.ok) {
          throw new Error(uploadJson.message || "Failed to submit proposal.");
        }

        if (uploadJson.workshopId) {
          setWorkshopId(uploadJson.workshopId);
        }

        toast.success("Workshop proposal submitted successfully!");
        setFiles([]);
        setUploadedCount((prev) => Math.min(MAX_FILES, prev + files.length));
      } catch (error) {
        console.error("Error during workshop proposal submission:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while submitting your proposal.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      workshopTitle,
      name,
      files,
      uploadedCount,
      user,
      description,
      eventId,
      researchDomain,
      capacity,
    ],
  );

  return {
    // Session
    user,
    isAuthenticated: !!user,
    isPending: isSessionPending,

    // Form state
    workshopTitle,
    name,
    email,
    researchDomain,
    description,
    capacity,
    files,

    // Upload state
    uploadedCount,
    isLoadingQuota,
    isSubmitting,
    isDragOver,
    workshopId,

    // Derived state
    remainingSlots,
    canAddMoreFiles,
    maxFiles: MAX_FILES,

    // Handlers
    handleWorkshopTitleChange,
    handleNameChange,
    handleResearchDomainChange,
    handleDescriptionChange,
    handleCapacityChange,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleRemoveFile,
    handleSubmit,
  };
}
