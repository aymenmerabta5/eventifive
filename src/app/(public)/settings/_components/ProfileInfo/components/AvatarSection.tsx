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
    <div className="border-border/50 flex flex-col gap-6 border-b pb-8 sm:flex-row sm:items-start">
      {/* Avatar with upload overlay */}
      <div className="group relative shrink-0">
        <div className="relative">
          {/* Decorative ring */}
          <div className="from-primary/20 via-primary/10 absolute -inset-1 rounded-full bg-linear-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <Avatar className="ring-border/50 group-hover:ring-primary/30 relative h-24 w-24 ring-2 transition-all duration-300 sm:h-28 sm:w-28">
            {userImage && imageUrl && (
              <AvatarImage
                src={imageUrl}
                alt={userName || "Profile"}
                className="object-cover"
              />
            )}
            <AvatarFallback className="from-primary to-primary/70 text-primary-foreground bg-linear-to-br text-xl font-semibold sm:text-2xl">
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
            className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/60 opacity-0 transition-all duration-200 group-hover:opacity-100 disabled:cursor-not-allowed"
            aria-label="Change profile picture"
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-white" />
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
          <h3 className="text-foreground font-medium">Profile Photo</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            This will be displayed on your profile and in comments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onTriggerUpload}
            disabled={isUploading}
            className="border-border/50 bg-background hover:bg-muted/50 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
