import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Sparkles, BookOpen } from "lucide-react";

interface WorkshopDescriptionFieldProps {
  description: string;
  onDescriptionChange: (value: string) => void;
}

export function WorkshopDescriptionField({
  description,
  onDescriptionChange,
}: WorkshopDescriptionFieldProps) {
  const charCount = description.length;
  const minChars = 100;
  const isGoodLength = charCount >= minChars;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="from-chart-3/20 to-chart-3/5 ring-chart-3/10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1">
          <FileText className="text-chart-3 h-5 w-5" />
        </div>
        <div className="flex-1">
          <Label
            htmlFor="description"
            className="flex items-center gap-2 text-base font-semibold"
          >
            Workshop Description
            {isGoodLength && (
              <Sparkles className="animate-in zoom-in h-3.5 w-3.5 text-green-500 duration-200" />
            )}
          </Label>
          <p className="text-muted-foreground text-xs">
            Help reviewers understand your workshop&apos;s value
          </p>
        </div>
      </div>

      {/* Textarea with enhanced styling */}
      <div className="relative">
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="Describe your workshop objectives, target audience, and what participants will learn. Include any prerequisites, materials needed, and expected outcomes..."
          className="focus:shadow-primary/5 min-h-[180px] resize-y text-sm leading-relaxed transition-all duration-200 focus:shadow-lg"
        />

        {/* Character counter */}
        <div className="absolute right-3 bottom-3 flex items-center gap-2 text-xs">
          <span
            className={`transition-colors ${
              isGoodLength ? "text-green-500" : "text-muted-foreground"
            }`}
          >
            {charCount} chars
          </span>
          {!isGoodLength && charCount > 0 && (
            <span className="text-muted-foreground/60">
              ({minChars - charCount} more recommended)
            </span>
          )}
        </div>
      </div>

      {/* Writing tips */}
      <div className="border-border/40 bg-muted/20 rounded-xl border p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <BookOpen className="text-primary h-4 w-4" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Tips for a great description</p>
            <ul className="text-muted-foreground grid gap-1.5 text-xs sm:grid-cols-2">
              <li className="flex items-center gap-1.5">
                <span className="bg-primary h-1 w-1 rounded-full" />
                Clear learning objectives
              </li>
              <li className="flex items-center gap-1.5">
                <span className="bg-primary h-1 w-1 rounded-full" />
                Target audience level
              </li>
              <li className="flex items-center gap-1.5">
                <span className="bg-primary h-1 w-1 rounded-full" />
                Hands-on activities planned
              </li>
              <li className="flex items-center gap-1.5">
                <span className="bg-primary h-1 w-1 rounded-full" />
                Expected takeaways
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Keep backwards compatibility
export { WorkshopDescriptionField as AboutIdeaField };
