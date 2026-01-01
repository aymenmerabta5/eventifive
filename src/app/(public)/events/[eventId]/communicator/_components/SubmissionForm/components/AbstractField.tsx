import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollText, Sparkles } from "lucide-react";
import { MAX_ABSTRACT_LENGTH } from "../types";

interface AbstractFieldProps {
  abstract: string;
  abstractLength: number;
  onAbstractChange: (value: string) => void;
}

export function AbstractField({
  abstract,
  abstractLength,
  onAbstractChange,
}: AbstractFieldProps) {
  const hasValue = abstract.trim().length > 0;

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/5 ring-1 ring-chart-2/10">
          <ScrollText className="h-5 w-5 text-chart-2" />
        </div>
        <div>
          <Label
            htmlFor="abstract"
            className="flex items-center gap-2 text-base font-semibold"
          >
            Abstract
            <span className="text-destructive">*</span>
            {hasValue && (
              <Sparkles className="h-3.5 w-3.5 text-chart-2 animate-in zoom-in duration-200" />
            )}
          </Label>
          <p className="text-xs text-muted-foreground">
            Summarize your research, methodology, and key findings
          </p>
        </div>
      </div>

      {/* Textarea field */}
      <div className="relative">
        <Textarea
          id="abstract"
          name="abstract"
          value={abstract}
          onChange={(event) => onAbstractChange(event.target.value)}
          placeholder="Provide a comprehensive summary of your research paper including the problem statement, methodology, results, and conclusions..."
          required
          maxLength={MAX_ABSTRACT_LENGTH}
          rows={8}
          className="min-h-[200px] resize-none text-base transition-all duration-200 focus:shadow-lg focus:shadow-primary/5"
        />
        {/* Character count */}
        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/60">
          {abstractLength}/{MAX_ABSTRACT_LENGTH}
        </div>
      </div>
    </div>
  );
}
