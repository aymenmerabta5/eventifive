import { Label } from "@/components/ui/label";
import { FlaskConical } from "lucide-react";

interface AboutIdeaFieldProps {
  aboutIdea: string;
  onAboutIdeaChange: (value: string) => void;
}

export function AboutIdeaField({
  aboutIdea,
  onAboutIdeaChange,
}: AboutIdeaFieldProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor="aboutIdea"
        className="flex items-center gap-2 text-sm font-medium"
      >
        <FlaskConical className="text-muted-foreground h-4 w-4" />
        About your idea
      </Label>
      <textarea
        id="aboutIdea"
        name="aboutIdea"
        value={aboutIdea}
        onChange={(event) => onAboutIdeaChange(event.target.value)}
        placeholder="Tell us about your workshop idea or research project..."
        className="border-input bg-background placeholder:text-muted-foreground focus:ring-ring min-h-24 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
      />
      <p className="text-muted-foreground text-xs">
        Share your vision, goals, and what participants will learn
      </p>
    </div>
  );
}
