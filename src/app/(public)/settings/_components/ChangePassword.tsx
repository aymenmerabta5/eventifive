"use client";

import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Key } from "lucide-react";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import { changePasswordSchema } from "@/lib/schemas/schemas";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { isZeroValueString } from "motion/react";

export default function ChangePassword(){
  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = changePasswordSchema.safeParse(value);
        if (!result.success) {
          return {
            form: result.error.formErrors.formErrors[0],
            fields: result.error.flatten().fieldErrors,
          };
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        console.log("Form submitted with values:", value);
        await authClient.changePassword({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        }, {
          onSuccess: () => {
            toast.success("Password updated successfully");
          },
          onError: (error) => {
            toast.error("Failed to update password");
          },
        });
        // TODO: Implement your backend API call here
      } catch (error) {
        console.error("Failed to update password:", error);
      }
    },
  });
  return (
    <form 
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await form.handleSubmit();
        return false;
      }}
      className="flex flex-col gap-4 mt-12 border-border border-b pb-12"
    >
      <form.Field name="currentPassword">
        {(field) => (
          <div className="space-y-2">
            <Label
              htmlFor={field.name}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Key className="size-4" />
              Current Password
            </Label>
            <Input
              id={field.name}
              name={field.name}
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter your current password"
              className="w-full"
            />
          </div>
        )}
      </form.Field>
      <form.Field name="newPassword">
        {(field) => (
          <div className="space-y-2">
            <Label
              htmlFor={field.name}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Key className="size-4" />
              New Password
            </Label>
            <Input
              id={field.name}
              name={field.name}
              type="password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter your new password"
              className="w-full"
            />
          </div>
        )}
      </form.Field>
      <form.Subscribe>
        {(state) => (
          <StatefulButton
            type="submit"
            className="mt-6 h-11 w-full rounded-4xl cursor-pointer"
            disabled={!state.canSubmit || state.isSubmitting || !state.values.currentPassword || !state.values.newPassword}
          >
            {state.isSubmitting ? "Updating Password..." : "Update Password"}
          </StatefulButton>
        )}
      </form.Subscribe>
    </form>
  );
}
