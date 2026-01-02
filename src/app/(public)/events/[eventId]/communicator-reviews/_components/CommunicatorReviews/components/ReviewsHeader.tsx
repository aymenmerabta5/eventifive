import { Badge } from "@/components/ui/badge";
import { ClipboardList, Sparkles } from "lucide-react";

interface ReviewsHeaderProps {
  submissionCount: number;
}

export function ReviewsHeader({ submissionCount }: ReviewsHeaderProps) {
  return (
    <header className="space-y-6 text-center">
      {/* Top badge with count */}
      <div className="flex items-center justify-center gap-3">
        <Badge
          variant="secondary"
          className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-2 border px-4 py-2 font-medium backdrop-blur-sm"
        >
          <ClipboardList className="h-4 w-4" />
          <span>Assigned Reviews</span>
          <span className="bg-primary text-primary-foreground ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold">
            {submissionCount}
          </span>
        </Badge>
      </div>

      {/* Main heading with decorative elements */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="bg-primary/30 h-32 w-96 rounded-full blur-3xl" />
        </div>
        <h1 className="font-display relative text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          <span className="from-foreground via-foreground to-foreground/70 bg-gradient-to-br bg-clip-text text-transparent">
            Communicator
          </span>
          <br />
          <span className="text-primary inline-flex items-center gap-3">
            Applications
            <Sparkles className="text-primary/60 h-6 w-6 sm:h-8 sm:w-8" />
          </span>
        </h1>
      </div>

      {/* Description */}
      <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed sm:text-lg">
        Review each communicator application below. Open submissions to examine
        uploaded documents and provide your{" "}
        <span className="text-foreground font-medium">accept</span> or{" "}
        <span className="text-foreground font-medium">reject</span>{" "}
        recommendation.
      </p>

      {/* Decorative line */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <div className="bg-border h-px w-16" />
        <div className="bg-primary/50 h-1.5 w-1.5 rounded-full" />
        <div className="bg-border h-px w-16" />
      </div>
    </header>
  );
}
