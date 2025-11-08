"use client";

import type { User as BetterAuthUser } from "better-auth";
import { useForm } from "@tanstack/react-form";
import { changeEmailSchema } from "@/lib/schemas/schemas";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface ChangeEmailProps {
  user: BetterAuthUser;
}

export default function ChangeEmail({ user }: ChangeEmailProps) {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      email: user?.email || "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = changeEmailSchema.safeParse(value);
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
        await authClient.changeEmail({
          newEmail: value.email,
        }, {
          onSuccess: async () => {
            toast.success("Email updated successfully");
            // Force better-auth to refetch the session from the backend
            await authClient.getSession({
              fetchOptions: {
                cache: 'no-store'
              }
            });
            // Refresh the Next.js page to update server-side data
            router.refresh();
          },

          onError: () => {
            toast.error("Failed to update email");
          },
        });
      } catch (error) {
        console.error("Failed to update email:", error);
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
      <form.Field name="email">
        {(field) => (
          <div className="space-y-2">
            <Label
              htmlFor={field.name}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Mail className="size-4" />
              Email Address
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
      <form.Subscribe>
        {(state) => (
          <StatefulButton
            type="submit"
            className="mt-6 h-11 w-full rounded-4xl cursor-pointer"
            disabled={!state.canSubmit || state.isSubmitting || user?.email === state.values.email}
          >
            {state.isSubmitting ? "Updating..." : "Update Email"}
          </StatefulButton>
        )}
      </form.Subscribe>
    </form>
  );
}
