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
              className="text-foreground flex items-center gap-2 text-sm font-medium"
            >
              <User className="text-muted-foreground size-4" />
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
              className="bg-background/50 border-border/50 focus:border-primary/50 h-11 transition-colors"
            />
            <p className="text-muted-foreground text-xs">
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
              className="text-foreground flex items-center gap-2 text-sm font-medium"
            >
              <Building2 className="text-muted-foreground size-4" />
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
              className="bg-background/50 border-border/50 focus:border-primary/50 h-11 transition-colors"
            />
            <p className="text-muted-foreground text-xs">
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
              className="text-foreground flex items-center gap-2 text-sm font-medium"
            >
              <FlaskConical className="text-muted-foreground size-4" />
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
              className="bg-background/50 border-border/50 focus:border-primary/50 h-11 transition-colors"
            />
            <p className="text-muted-foreground text-xs">
              Your area of research or professional expertise.
            </p>
          </div>
        )}
      </form.Field>

      {/* Biography Field */}
      <form.Field name="biography">
        {(field: BiographyFieldApi) => (
          <div className="space-y-2">
            <Label className="text-foreground flex items-center gap-2 text-sm font-medium">
              <BookTextIcon className="text-muted-foreground size-4" />
              Biography
            </Label>
            <div className="border-border/50 bg-background/50 focus-within:border-primary/50 overflow-hidden rounded-lg border transition-colors">
              <Editor
                content={initialBiography}
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Tell others about yourself. This will be visible on your public
              profile.
            </p>
          </div>
        )}
      </form.Field>

      {/* Submit Button */}
      <div className="border-border/50 flex justify-end border-t pt-4">
        <form.Subscribe>
          {(state: FormState) => (
            <StatefulButton
              type="submit"
              className="h-11 cursor-pointer rounded-lg px-8 font-medium"
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
