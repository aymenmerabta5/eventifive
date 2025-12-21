"use client";

import type { JSONContent } from "@tiptap/react";
import { useImageUpload, useProfileForm } from "./hooks";
import { AvatarSection, ProfileForm } from "./components";
import type { ProfileInfoProps } from "./types";

export function ProfileInfo({ user, onSessionRefresh }: ProfileInfoProps) {
  const {
    fileInputRef,
    imageUrl,
    isLoadingImage,
    isUploading,
    handleFileChange,
    triggerFileInput,
  } = useImageUpload(onSessionRefresh);

  const { form } = useProfileForm(user, onSessionRefresh);

  return (
    <div className="space-y-8">
      <AvatarSection
        userId={user.id}
        userName={user.name}
        userImage={user.image ?? null}
        imageUrl={imageUrl}
        isLoadingImage={isLoadingImage}
        isUploading={isUploading}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        onTriggerUpload={triggerFileInput}
      />

      <ProfileForm
        form={form}
        initialBiography={user.biography as unknown as JSONContent | undefined}
      />
    </div>
  );
}
