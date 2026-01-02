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
        <div className="from-primary/20 to-primary/5 ring-primary/10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1">
          <FileText className="text-primary h-5 w-5" />
        </div>
        <div>
          <Label
            htmlFor="title"
            className="flex items-center gap-2 text-base font-semibold"
          >
            Paper Title
            <span className="text-destructive">*</span>
            {hasValue && (
              <Sparkles className="text-primary animate-in zoom-in h-3.5 w-3.5 duration-200" />
            )}
          </Label>
          <p className="text-muted-foreground text-xs">
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
          className="focus:shadow-primary/5 h-12 pr-20 text-base transition-all duration-200 focus:shadow-lg"
        />
        {/* Character count */}
        <div className="text-muted-foreground/60 absolute top-1/2 right-4 -translate-y-1/2 text-xs">
          {titleLength}/{MAX_TITLE_LENGTH}
        </div>
      </div>
    </div>
  );
}
