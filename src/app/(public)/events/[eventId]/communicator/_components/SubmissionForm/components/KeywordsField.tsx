import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tags } from "lucide-react";
import { MAX_KEYWORDS_LENGTH } from "../types";

interface KeywordsFieldProps {
  keywords: string;
  keywordsLength: number;
  onKeywordsChange: (value: string) => void;
}

export function KeywordsField({
  keywords,
  keywordsLength,
  onKeywordsChange,
}: KeywordsFieldProps) {
  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="from-chart-3/20 to-chart-3/5 ring-chart-3/10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1">
          <Tags className="text-chart-3 h-5 w-5" />
        </div>
        <div>
          <Label
            htmlFor="keywords"
            className="flex items-center gap-2 text-base font-semibold"
          >
            Keywords
            <span className="text-muted-foreground text-xs font-normal">
              (Optional)
            </span>
          </Label>
          <p className="text-muted-foreground text-xs">
            Separate keywords with commas for better discoverability
          </p>
        </div>
      </div>

      {/* Input field */}
      <div className="relative">
        <Input
          id="keywords"
          name="keywords"
          value={keywords}
          onChange={(event) => onKeywordsChange(event.target.value)}
          placeholder="e.g., machine learning, neural networks, data science"
          maxLength={MAX_KEYWORDS_LENGTH}
          className="focus:shadow-primary/5 h-12 pr-20 text-base transition-all duration-200 focus:shadow-lg"
        />
        {/* Character count */}
        <div className="text-muted-foreground/60 absolute top-1/2 right-4 -translate-y-1/2 text-xs">
          {keywordsLength}/{MAX_KEYWORDS_LENGTH}
        </div>
      </div>
    </div>
  );
}
