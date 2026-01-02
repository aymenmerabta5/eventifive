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
import type {
  SubmissionTypeValue,
  SubmissionStatusResponse,
  SubmissionResponse,
  ExistingSubmission,
} from "../types";
import {
  MAX_TITLE_LENGTH,
  MAX_ABSTRACT_LENGTH,
  MAX_KEYWORDS_LENGTH,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
} from "../types";

interface UseSubmissionFormProps {
  eventId: string;
}

export function useSubmissionForm({ eventId }: UseSubmissionFormProps) {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const user = session?.user;

  // Form state
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState("");
  const [submissionType, setSubmissionType] =
    useState<SubmissionTypeValue>("oral");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  // Submission status
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [existingSubmission, setExistingSubmission] =
    useState<ExistingSubmission | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // Sync user data
  useEffect(() => {
    if (!user) return;

    setName(user.name ?? "");
    setEmail(user.email ?? "");
  }, [user]);

  // Check if user already submitted
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setIsCheckingStatus(true);

    fetch(`/api/submit-communicator?eventId=${encodeURIComponent(eventId)}`)
      .then(async (response) => {
        const json = (await response.json()) as SubmissionStatusResponse;

        if (!response.ok) {
          throw new Error(json.message || "Failed to check submission status");
        }

        return json;
      })
      .then((json) => {
        if (cancelled) return;
        setHasSubmitted(json.hasSubmitted);
        setExistingSubmission(json.submission);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Error checking submission status:", error);
      })
      .finally(() => {
        if (cancelled) return;
        setIsCheckingStatus(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, user]);

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Only PDF, DOC, and DOCX files are allowed.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File must be less than 10MB.";
    }
    return null;
  }, []);

  // Add file helper
  const addFile = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }
      // Only allow one file
      setFiles([file]);
    },
    [validateFile],
  );

  // Handlers
  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const selected = event.target.files?.[0];
      if (selected) {
        addFile(selected);
      }
      event.target.value = "";
    },
    [addFile],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);

      const dropped = event.dataTransfer.files?.[0];
      if (dropped) {
        addFile(dropped);
      }
    },
    [addFile],
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
  }, []);

  const handleTitleChange = useCallback((value: string) => {
    if (value.length <= MAX_TITLE_LENGTH) {
      setTitle(value);
    }
  }, []);

  const handleAbstractChange = useCallback((value: string) => {
    if (value.length <= MAX_ABSTRACT_LENGTH) {
      setAbstract(value);
    }
  }, []);

  const handleKeywordsChange = useCallback((value: string) => {
    if (value.length <= MAX_KEYWORDS_LENGTH) {
      setKeywords(value);
    }
  }, []);

  const handleSubmissionTypeChange = useCallback(
    (value: SubmissionTypeValue) => {
      setSubmissionType(value);
    },
    [],
  );

  const handleNameChange = useCallback((value: string) => {
    setName(value);
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();

      // Validation
      if (title.trim().length === 0) {
        toast.error("Please enter a title for your submission.");
        return;
      }

      if (abstract.trim().length === 0) {
        toast.error("Please enter an abstract for your submission.");
        return;
      }

      if (files.length === 0) {
        toast.error("Please upload your paper document.");
        return;
      }

      if (!user) {
        toast.error("You must be logged in to submit a paper.");
        return;
      }

      if (hasSubmitted) {
        toast.error("You have already submitted a paper for this event.");
        return;
      }

      setIsSubmitting(true);

      try {
        const file = files[0];
        if (!file) {
          throw new Error("No file selected");
        }

        const formData = new FormData();
        formData.set("file", file);
        formData.set("eventId", eventId);
        formData.set("title", title.trim());
        formData.set("abstract", abstract.trim());
        formData.set("keywords", keywords.trim());
        formData.set("type", submissionType);

        const response = await fetch("/api/submit-communicator", {
          method: "POST",
          body: formData,
        });

        const json = (await response.json()) as SubmissionResponse;

        if (!response.ok) {
          throw new Error(json.message || "Failed to submit paper.");
        }

        if (json.submissionId) {
          setSubmissionId(json.submissionId);
          setHasSubmitted(true);
          setExistingSubmission({
            id: json.submissionId,
            title: title.trim(),
            status: "draft",
            submittedAt: new Date().toISOString(),
          });
        }

        toast.success("Paper submitted successfully!");

        // Reset form
        setTitle("");
        setAbstract("");
        setKeywords("");
        setSubmissionType("oral");
        setFiles([]);
      } catch (error) {
        console.error("Error submitting paper:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while submitting your paper.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      title,
      abstract,
      keywords,
      submissionType,
      files,
      user,
      hasSubmitted,
      eventId,
    ],
  );

  // Calculate form progress
  const calculateProgress = useCallback(() => {
    let filled = 0;
    const total = 4; // title, abstract, type, file
    if (title.trim()) filled++;
    if (abstract.trim()) filled++;
    if (submissionType) filled++;
    if (files.length > 0) filled++;
    return (filled / total) * 100;
  }, [title, abstract, submissionType, files]);

  return {
    // Session
    user,
    isAuthenticated: !!user,
    isPending: isSessionPending,

    // Form state
    title,
    abstract,
    keywords,
    submissionType,
    name,
    email,
    files,

    // Submission status
    hasSubmitted,
    existingSubmission,
    isCheckingStatus,

    // UI state
    isSubmitting,
    isDragOver,
    submissionId,

    // Progress
    progress: calculateProgress(),

    // Character counts
    titleLength: title.length,
    abstractLength: abstract.length,
    keywordsLength: keywords.length,
    maxTitleLength: MAX_TITLE_LENGTH,
    maxAbstractLength: MAX_ABSTRACT_LENGTH,
    maxKeywordsLength: MAX_KEYWORDS_LENGTH,

    // Handlers
    handleTitleChange,
    handleAbstractChange,
    handleKeywordsChange,
    handleSubmissionTypeChange,
    handleNameChange,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleRemoveFile,
    handleSubmit,
  };
}
