"use client";

import type { RefObject } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Upload, ExternalLink } from "lucide-react";

interface AvatarSectionProps {
  userId: string;
  userName: string | null;
  userImage: string | null;
  imageUrl: string | null;
  isLoadingImage: boolean;
  isUploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTriggerUpload: () => void;
}

export function AvatarSection({
  userId,
  userName,
  userImage,
  imageUrl,
  isLoadingImage,
  isUploading,
  fileInputRef,
  onFileChange,
  onTriggerUpload,
}: AvatarSectionProps) {
  const userInitials =
    userName
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-6 pb-8 border-b border-border/50">
      {/* Avatar with upload overlay */}
      <div className="relative group shrink-0">
        <div className="relative">
          {/* Decorative ring */}
          <div className="absolute -inset-1 rounded-full bg-linear-to-br from-primary/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <Avatar className="relative h-24 w-24 sm:h-28 sm:w-28 ring-2 ring-border/50 transition-all duration-300 group-hover:ring-primary/30">
            {userImage && imageUrl && (
              <AvatarImage
                src={imageUrl}
                alt={userName || "Profile"}
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-linear-to-br from-primary to-primary/70 text-primary-foreground text-xl sm:text-2xl font-semibold">
              {isLoadingImage ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                userInitials
              )}
            </AvatarFallback>
          </Avatar>

          {/* Upload overlay */}
          <button
            type="button"
            onClick={onTriggerUpload}
            disabled={isUploading}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-all duration-200 group-hover:opacity-100 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Change profile picture"
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
              <Camera className="h-6 w-6 text-white" />
            )}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="sr-only"
          aria-label="Upload profile picture"
        />
      </div>

      {/* Photo info and upload button */}
      <div className="flex-1 space-y-3">
        <div>
          <h3 className="font-medium text-foreground">Profile Photo</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This will be displayed on your profile and in comments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onTriggerUpload}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border/50 bg-background hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload new photo
              </>
            )}
          </button>

          {userId && (
            <Button
              asChild
              variant="outline"
              className="inline-flex items-center gap-2"
            >
              <Link href={`/users/${userId}` as Route}>
                <ExternalLink className="h-4 w-4" />
                View Public Profile
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
