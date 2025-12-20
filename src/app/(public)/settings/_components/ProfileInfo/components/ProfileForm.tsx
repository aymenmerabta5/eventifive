"use client";

import type { JSONContent } from "@tiptap/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import Editor from "@/components/rich-text-editor/Editor";
import { User, BookTextIcon, Building2, FlaskConical } from "lucide-react";

interface StringFieldApi {
  name: string;
  state: { value: string };
  handleBlur: () => void;
  handleChange: (value: string) => void;
}

interface BiographyFieldApi {
  name: string;
  state: { value: JSONContent | undefined };
  handleBlur: () => void;
  handleChange: (value: JSONContent | undefined) => void;
}

interface FormState {
  canSubmit: boolean;
  isSubmitting: boolean;
}

interface ProfileFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  initialBiography: JSONContent | undefined;
}

export function ProfileForm({ form, initialBiography }: ProfileFormProps) {
  return (
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
        {(field: StringFieldApi) => (
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
        {(field: StringFieldApi) => (
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
        {(field: StringFieldApi) => (
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
        {(field: BiographyFieldApi) => (
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <BookTextIcon className="size-4 text-muted-foreground" />
              Biography
            </Label>
            <div className="rounded-lg border border-border/50 bg-background/50 overflow-hidden focus-within:border-primary/50 transition-colors">
              <Editor
                content={initialBiography}
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Tell others about yourself. This will be visible on your public
              profile.
            </p>
          </div>
        )}
      </form.Field>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-border/50">
        <form.Subscribe>
          {(state: FormState) => (
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
  );
}
