"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, BookTextIcon, Camera, Loader2, Upload, Building2, FlaskConical, ExternalLink } from "lucide-react";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import { useMutation } from "@tanstack/react-query";
import Editor from "@/components/rich-text-editor/Editor";
import type { JSONContent } from "@tiptap/react";
import { useRef, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useProfileImage } from "@/hooks/use-profile-image";
import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";

interface ProfileInfoProps {
  user: typeof authClient.$Infer.Session.user;
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  const { imageUrl, isLoading: isLoadingImage, invalidateImage } = useProfileImage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { mutate: updateProfile } = useMutation(
    orpc.profile.update.mutationOptions({
      onSuccess: () => {
        toast.success("Profile updated successfully");
      },
      onError: () => {
        toast.error("Failed to update profile");
      },
    })
  );

  const handleImageUpload = async (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, GIF, or WebP)");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    e.target.value = "";
  };

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const form = useForm({
    defaultValues: {
      name: user?.name || "",
      biography: user?.biography as unknown as JSONContent | undefined,
      institution: user?.institution || "",
      researchDomain: user?.researchDomain || "",
    },
    onSubmit: async ({ value }) => {
      try {
        console.log("Form submitted with values:", value);
        updateProfile({
          name: value.name,
          biography: value.biography,
          institution: value.institution || undefined,
          researchDomain: value.researchDomain || undefined,
        });
      } catch (error) {
        console.error("Failed to update profile:", error);
      }
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start gap-6 pb-8 border-b border-border/50">
        {/* Avatar with upload overlay */}
        <div className="relative group shrink-0">
          <div className="relative">
            {/* Decorative ring */}
            <div className="absolute -inset-1 rounded-full bg-linear-to-br from-primary/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <Avatar className="relative h-24 w-24 sm:h-28 sm:w-28 ring-2 ring-border/50 transition-all duration-300 group-hover:ring-primary/30">
              {user?.image && imageUrl && (
                <AvatarImage
                  src={imageUrl}
                  alt={user?.name || "Profile"}
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
              onClick={() => fileInputRef.current?.click()}
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
            onChange={handleFileChange}
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
              onClick={() => fileInputRef.current?.click()}
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
            
            {user?.id && (
              <Button
                asChild
                variant="outline"
                className="inline-flex items-center gap-2"
              >
                <Link href={`/users/${user.id}` as Route}>
                  <ExternalLink className="h-4 w-4" />
                  View Public Profile
                </Link>
              </Button>
            )}
          </div>
          
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        {/* Full Name Field */}
        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor={field.name}
                className="flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <User className="size-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter your full name"
                className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                This is how your name will appear across the platform.
              </p>
            </div>
          )}
        </form.Field>

        {/* Institution Field */}
        <form.Field name="institution">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor={field.name}
                className="flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <Building2 className="size-4 text-muted-foreground" />
                Institution
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter your institution or organization"
                className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                Your university, company, or research organization.
              </p>
            </div>
          )}
        </form.Field>

        {/* Research Domain Field */}
        <form.Field name="researchDomain">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor={field.name}
                className="flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <FlaskConical className="size-4 text-muted-foreground" />
                Research Domain
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter your research domain or field of expertise"
                className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                Your area of research or professional expertise.
              </p>
            </div>
          )}
        </form.Field>

        {/* Biography Field */}
        <form.Field name="biography">
          {(field) => (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <BookTextIcon className="size-4 text-muted-foreground" />
                Biography
              </Label>
              <div className="rounded-lg border border-border/50 bg-background/50 overflow-hidden focus-within:border-primary/50 transition-colors">
                <Editor
                  content={user.biography as unknown as JSONContent}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Tell others about yourself. This will be visible on your public profile.
              </p>
            </div>
          )}
        </form.Field>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-border/50">
          <form.Subscribe>
            {(state) => (
              <StatefulButton
                type="submit"
                className="h-11 px-8 rounded-lg font-medium cursor-pointer"
                disabled={!state.canSubmit || state.isSubmitting}
              >
                {state.isSubmitting ? "Saving changes..." : "Save changes"}
              </StatefulButton>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
}
