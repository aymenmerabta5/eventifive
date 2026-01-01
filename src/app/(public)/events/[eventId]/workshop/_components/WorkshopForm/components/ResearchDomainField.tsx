import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FlaskConical, Lightbulb } from "lucide-react";

interface ResearchDomainFieldProps {
  researchDomain: string;
  onResearchDomainChange: (value: string) => void;
}

const DOMAIN_SUGGESTIONS = [
  "AI/ML",
  "Web Dev",
  "Data Science",
  "Cloud",
  "Security",
];

export function ResearchDomainField({
  researchDomain,
  onResearchDomainChange,
}: ResearchDomainFieldProps) {
  return (
    <div className="space-y-3">
      <Label
        htmlFor="researchDomain"
        className="flex items-center gap-2 text-sm font-medium"
      >
        <FlaskConical className="h-3.5 w-3.5 text-muted-foreground" />
        Research Domain
      </Label>
      <Input
        id="researchDomain"
        name="researchDomain"
        type="text"
        value={researchDomain}
        onChange={(event) => onResearchDomainChange(event.target.value)}
        placeholder="e.g., Artificial Intelligence"
        autoComplete="organization-title"
        className="h-11 transition-all duration-200 focus:shadow-lg focus:shadow-primary/5"
      />

      {/* Quick suggestions */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lightbulb className="h-3 w-3" />
          <span>Quick picks:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DOMAIN_SUGGESTIONS.map((domain) => (
            <button
              key={domain}
              type="button"
              onClick={() => onResearchDomainChange(domain)}
              className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            >
              {domain}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
