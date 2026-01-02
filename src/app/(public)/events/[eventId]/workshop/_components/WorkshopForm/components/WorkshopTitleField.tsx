import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Presentation, Sparkles } from "lucide-react";

interface WorkshopTitleFieldProps {
  workshopTitle: string;
  onWorkshopTitleChange: (value: string) => void;
}

export function WorkshopTitleField({
  workshopTitle,
  onWorkshopTitleChange,
}: WorkshopTitleFieldProps) {
  const hasValue = workshopTitle.trim().length > 0;

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="from-primary/20 to-primary/5 ring-primary/10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1">
          <Presentation className="text-primary h-5 w-5" />
        </div>
        <div>
          <Label
            htmlFor="workshopTitle"
            className="flex items-center gap-2 text-base font-semibold"
          >
            Workshop Title
            <span className="text-destructive">*</span>
            {hasValue && (
              <Sparkles className="text-primary animate-in zoom-in h-3.5 w-3.5 duration-200" />
            )}
          </Label>
          <p className="text-muted-foreground text-xs">
            Choose a compelling title that captures your workshop&apos;s essence
          </p>
        </div>
      </div>

      {/* Input field */}
      <div className="relative">
        <Input
          id="workshopTitle"
          name="workshopTitle"
          value={workshopTitle}
          onChange={(event) => onWorkshopTitleChange(event.target.value)}
          placeholder="e.g., Building Modern Web Applications with React"
          required
          maxLength={255}
          className="focus:shadow-primary/5 h-12 text-base transition-all duration-200 focus:shadow-lg"
        />
        {/* Character count */}
        <div className="text-muted-foreground/60 absolute top-1/2 right-4 -translate-y-1/2 text-xs">
          {workshopTitle.length}/255
        </div>
      </div>
    </div>
  );
}
