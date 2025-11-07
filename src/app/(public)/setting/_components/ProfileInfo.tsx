"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import type { User as BetterAuthUser } from "better-auth";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

interface ProfileInfoProps {
  user: BetterAuthUser;
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  const form = useForm({
    defaultValues: {
      name: user?.name || "",
    },
    onSubmit: async ({ value }) => {
      try {
        console.log("Form submitted with values:", value);

        toast.success("Profile updated successfully");
      } catch (error) {
        console.error("Failed to update profile:", error);
        toast.error("Failed to update profile");
      }
    },
  });

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="border-border mt-12 space-y-4 border-b pb-12"
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

        {/* Submit Button */}
        <form.Subscribe>
          {(state) => (
            <StatefulButton
              type="submit"
              className="mt-6 h-11 w-full rounded-4xl cursor-pointer"
              disabled={!state.canSubmit || state.isSubmitting || user?.name === state.values.name}
            >
              {state.isSubmitting ? "Updating..." : "Update Profile"}
            </StatefulButton>
          )}
        </form.Subscribe>
      </form>
    </>
  );
}
