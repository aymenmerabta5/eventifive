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
        <div className="from-chart-2/20 to-chart-2/5 ring-chart-2/10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1">
          <ScrollText className="text-chart-2 h-5 w-5" />
        </div>
        <div>
          <Label
            htmlFor="abstract"
            className="flex items-center gap-2 text-base font-semibold"
          >
            Abstract
            <span className="text-destructive">*</span>
            {hasValue && (
              <Sparkles className="text-chart-2 animate-in zoom-in h-3.5 w-3.5 duration-200" />
            )}
          </Label>
          <p className="text-muted-foreground text-xs">
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
          className="focus:shadow-primary/5 min-h-[200px] resize-none text-base transition-all duration-200 focus:shadow-lg"
        />
        {/* Character count */}
        <div className="text-muted-foreground/60 absolute right-3 bottom-3 text-xs">
          {abstractLength}/{MAX_ABSTRACT_LENGTH}
        </div>
      </div>
    </div>
  );
}
