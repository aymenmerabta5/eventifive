import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Sparkles } from "lucide-react";
import { MAX_TITLE_LENGTH } from "../types";

interface TitleFieldProps {
  title: string;
  titleLength: number;
  onTitleChange: (value: string) => void;
}

export function TitleField({
  title,
  titleLength,
  onTitleChange,
}: TitleFieldProps) {
  const hasValue = title.trim().length > 0;

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <Label
            htmlFor="title"
            className="flex items-center gap-2 text-base font-semibold"
          >
            Paper Title
            <span className="text-destructive">*</span>
            {hasValue && (
              <Sparkles className="h-3.5 w-3.5 text-primary animate-in zoom-in duration-200" />
            )}
          </Label>
          <p className="text-xs text-muted-foreground">
            A clear and descriptive title for your research paper
          </p>
        </div>
      </div>

      {/* Input field */}
      <div className="relative">
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="e.g., Machine Learning Applications in Climate Prediction"
          required
          maxLength={MAX_TITLE_LENGTH}
          className="h-12 pr-20 text-base transition-all duration-200 focus:shadow-lg focus:shadow-primary/5"
        />
        {/* Character count */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60">
          {titleLength}/{MAX_TITLE_LENGTH}
        </div>
      </div>
    </div>
  );
}
