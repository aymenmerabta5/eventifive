"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useProfileImage } from "@/hooks/use-profile-image";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "../constants";

export function useImageUpload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { imageUrl, isLoading: isLoadingImage, invalidateImage } = useProfileImage();

  const handleImageUpload = useCallback(async (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, GIF, or WebP)");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      let responseText = "";
      let responseData: unknown = null;

      try {
        responseText = await response.clone().text();
        responseData = JSON.parse(responseText);
      } catch {
        responseData = null;
      }

      if (!response.ok) {
        const messageFromJson =
          typeof responseData === "object" &&
          responseData !== null &&
          "message" in responseData &&
          typeof (responseData as { message?: unknown }).message === "string"
            ? (responseData as { message: string }).message
            : undefined;

        const errorMessage =
          messageFromJson ||
          responseText ||
          response.statusText ||
          "Failed to upload image";
        throw new Error(errorMessage);
      }

      toast.success("Profile image updated successfully!");
      // Refresh the Better Auth session to get the updated image
      await authClient.getSession({
        query: { disableCookieCache: true },
      });
      invalidateImage();
      router.refresh();
    } catch (error: unknown) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }, [invalidateImage, router]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    e.target.value = "";
  }, [handleImageUpload]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    fileInputRef,
    imageUrl,
    isLoadingImage,
    isUploading,
    handleFileChange,
    triggerFileInput,
  };
}
