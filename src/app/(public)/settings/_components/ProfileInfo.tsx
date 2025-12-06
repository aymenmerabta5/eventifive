"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, BookTextIcon, Camera, Loader2 } from "lucide-react";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { orpc, queryClient, client } from "@/utils/orpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import Editor from "@/components/rich-text-editor/Editor";
import type { JSONContent } from "@tiptap/react";
import { useRef, useState } from "react";


interface ProfileInfoProps {
  user: typeof authClient.$Infer.Session.user;
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

 
  const { data: profileImage, isLoading: isLoadingImage } = useQuery({
    queryKey: ["getProfileImageRouter", user?.id],
    queryFn: () => client.getProfileImageRouter({ userId: user?.id }),
    // Only fetch if user exists
    enabled: !!user?.id,
    // Keep the image URL fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Don't show error toast for "no image" case
    retry: false,
  });


  const { mutate: updateProfile } = useMutation(
    orpc.profileRouter.mutationOptions({
      onSuccess: () => {
        toast.success("Profile updated successfully");
      },
      onError: () => {
        toast.error("Failed to update profile");
      },
    })
  );

 
  const handleImageUpload = async (file: File) => {
    // VALIDATE file before upload
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, GIF, or WebP)");
      return;
    }
  
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image must be less than 5MB");
      return;
    }
  
    setIsUploading(true);
  
    try {
      // Build FormData
      const formData = new FormData();
      formData.append("file", file);
  
  
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
  
      // SAFELY read response (supports dev overlay double-read)
      let responseText = "";
      let responseData: any = null;
  
      try {
        responseText = await response.clone().text();
        responseData = JSON.parse(responseText);
      } catch {
        responseData = null;
      }
  
      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          responseText ||
          response.statusText ||
          "Failed to upload image";
  
        throw new Error(errorMessage);
      }
  
      toast.success("Profile image updated successfully!");
  
      // Refresh image immediately
      queryClient.invalidateQueries({
        queryKey: ["getProfileImageRouter"],
      });
  
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };
  

  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset the input so the same file can be selected again
    e.target.value = "";
  };


  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const form = useForm({
    defaultValues: {
      name: user?.name || "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      biography: (user as any).biography || undefined,
    },

    onSubmit: async ({ value }) => {
      try {
        console.log("Form submitted with values:", value);
        updateProfile({ name: value.name, biography: value.biography });
      } catch (error) {
        console.error("Failed to update profile:", error);
      }
    },
  });

  return (
    <>
      
      <div className="flex flex-col items-center gap-4 pb-8">
        <div className="relative group">
         
          <Avatar className="h-28 w-28 ring-4 ring-primary/20 transition-all group-hover:ring-primary/40">
            {profileImage?.downloadUrl && (
              <AvatarImage
                src={profileImage.downloadUrl}
                alt={user?.name || "Profile"}
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground text-2xl font-bold">
              {isLoadingImage ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                userInitials
              )}
            </AvatarFallback>
          </Avatar>

        
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Change profile picture"
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            ) : (
              <Camera className="h-8 w-8 text-white" />
            )}
          </button>

         
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Upload profile picture"
          />
        </div>

        
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="border-border space-y-4 border-t pt-8"
      >
        {/* Full Name Field */}
        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor={field.name}
                className="flex items-center gap-2 text-sm font-medium"
              >
                <User className="size-4" />
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
                className="w-full"
              />
            </div>
          )}
        </form.Field>
        <form.Field name="biography">
          {(field) => (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <BookTextIcon className="size-4" /> Biography
              </Label>
              <Editor
                content={user.biography as unknown as JSONContent}
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
              />
            </div>
          )}
        </form.Field>

        {/* Submit Button */}
        <form.Subscribe>
          {(state) => (
            <StatefulButton
              type="submit"
              className="mt-6 h-11 w-full rounded-4xl cursor-pointer"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? "Updating..." : "Update Profile"}
            </StatefulButton>
          )}
        </form.Subscribe>
      </form>
    </>
  );
}
