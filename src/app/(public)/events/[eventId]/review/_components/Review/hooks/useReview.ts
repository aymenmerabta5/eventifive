"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { RECOMMENDATION_THRESHOLD } from "../constants";
import type { ReviewRecommendation, ReviewData } from "../types";

interface UseReviewProps {
  submissionId: string;
}

export function useReview({ submissionId }: UseReviewProps) {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const user = session?.user;

  // Local state
  const [rating, setRating] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [submittedReview, setSubmittedReview] = useState<ReviewData | null>(
    null,
  );
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(
    null,
  );

  // Fetch submission
  const {
    data: submission,
    isPending: isSubmissionPending,
    error: submissionError,
    refetch: refetchSubmission,
    isRefetching: isSubmissionRefetching,
  } = useQuery({
    ...orpc.submissions.get.queryOptions({
      input: { id: submissionId },
    }),
    enabled: !!user,
    retry: false,
  });

  // Fetch existing review
  const {
    data: myReview,
    isPending: isReviewPending,
    error: reviewError,
  } = useQuery({
    ...orpc.reviews.getMine.queryOptions({
      input: { submissionId },
    }),
    enabled: !!user,
    retry: false,
  });

  // Sync form state with fetched review
  useEffect(() => {
    if (myReview && !submittedReview) {
      setRating(myReview.score ?? null);
      setComments(myReview.comment ?? "");
    }
  }, [myReview, submittedReview]);

  // Derived states
  const existingReview = submittedReview ?? myReview ?? null;
  const isReadOnly = !!existingReview;
  const isPending = isSessionPending || isSubmissionPending || isReviewPending;

  // Derive recommendation from rating
  const derivedRecommendation: ReviewRecommendation | undefined =
    useMemo(() => {
      if (rating === null) return undefined;
      return rating > RECOMMENDATION_THRESHOLD ? "accept" : "reject";
    }, [rating]);

  const recommendationToShow =
    existingReview?.recommendation ?? derivedRecommendation;

  // Error messages
  const errorMessage = useMemo(() => {
    if (!submissionError) return null;
    const msg = submissionError.message;
    if (msg?.includes("FORBIDDEN") || msg?.includes("permission")) {
      return "You do not have permission to access this submission. Please ensure you are assigned as a reviewer.";
    }
    if (msg?.includes("NOT_FOUND") || msg?.includes("not found")) {
      return "The submission you're looking for doesn't exist. Please check the submission ID.";
    }
    return "Failed to load submission details. Please try again.";
  }, [submissionError]);

  // Download mutation
  const downloadFileMutation = useMutation({
    mutationFn: async ({
      fileId,
      fileName,
    }: {
      fileId: string;
      fileName: string;
    }) => {
      const { downloadUrl } = await orpc.files.getDownloadUrl.call({ fileId });
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { downloadUrl, fileName };
    },
    onSuccess: () => {
      toast.success("File download started");
    },
    onError: (error) => {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation(
    orpc.reviews.create.mutationOptions({
      onSuccess: (createdReview) => {
        toast.success("Review submitted successfully");
        setSubmittedReview(createdReview as ReviewData);
        setComments(createdReview.comment ?? "");
        setRating(createdReview.score ?? null);
      },
      onError: (error) => {
        console.error("Error submitting review:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to submit review. Please try again.",
        );
      },
    }),
  );

  // Handlers
  const handleRefresh = useCallback(() => {
    void refetchSubmission();
  }, [refetchSubmission]);

  const handleDownload = useCallback(
    async (fileId: string, fileName: string) => {
      setDownloadingFileId(fileId);
      downloadFileMutation.mutate(
        { fileId, fileName },
        {
          onSettled: () => setDownloadingFileId(null),
        },
      );
    },
    [downloadFileMutation],
  );

  const handleRatingChange = useCallback((value: number) => {
    setRating(value);
  }, []);

  const handleCommentsChange = useCallback((value: string) => {
    setComments(value);
  }, []);

  const handleSubmitReview = useCallback(() => {
    if (existingReview) {
      toast.error(
        "You already submitted a review for this submission and cannot edit it.",
      );
      return;
    }

    if (rating === null) {
      toast.error(
        "Please provide a rating between 1 and 5 for this submission",
      );
      return;
    }

    if (!derivedRecommendation) {
      toast.error("Unable to determine recommendation from the rating");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to submit a review");
      return;
    }

    submitReviewMutation.mutate({
      submissionId,
      score: rating,
      recommendation: derivedRecommendation,
      comment: comments.trim() || undefined,
    });
  }, [
    existingReview,
    rating,
    derivedRecommendation,
    user,
    submitReviewMutation,
    submissionId,
    comments,
  ]);

  return {
    // Session
    user,
    isAuthenticated: !!user,

    // Submission data
    submission,
    submissionId,

    // Review data
    existingReview,
    isReadOnly,
    recommendationToShow,

    // Form state
    rating,
    comments,
    downloadingFileId,

    // Loading states
    isPending,
    isRefetching: isSubmissionRefetching,
    isSubmitting: submitReviewMutation.isPending,

    // Errors
    error: submissionError,
    errorMessage,
    reviewError,

    // Handlers
    handleRefresh,
    handleDownload,
    handleRatingChange,
    handleCommentsChange,
    handleSubmitReview,
  };
}
