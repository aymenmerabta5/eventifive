import { Card, CardContent } from "@/components/ui/card";
import { Inbox, Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <Card className="border-border/50 bg-card/50 relative overflow-hidden border-dashed backdrop-blur-sm">
      {/* Decorative background pattern */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary/5 absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl" />
        <div className="bg-secondary/10 absolute -bottom-12 -left-12 h-32 w-32 rounded-full blur-2xl" />
      </div>

      <CardContent className="relative flex flex-col items-center justify-center gap-6 py-16 text-center sm:py-20">
        {/* Icon container with gradient background */}
        <div className="relative">
          <div className="bg-primary/10 absolute inset-0 rounded-full blur-xl" />
          <div className="border-border bg-card relative flex h-20 w-20 items-center justify-center rounded-2xl border shadow-sm">
            <Inbox className="text-primary h-10 w-10" />
          </div>
          <div className="bg-primary/20 absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full">
            <Sparkles className="text-primary h-3.5 w-3.5" />
          </div>
        </div>

        {/* Text content */}
        <div className="max-w-sm space-y-2">
          <h3 className="font-display text-foreground text-xl font-semibold tracking-tight">
            No applications yet
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You don&apos;t have any communicator applications assigned for
            review. Check back later or contact the event organizer.
          </p>
        </div>

        {/* Decorative dots */}
        <div className="flex items-center gap-1.5 pt-2">
          <div className="bg-primary/30 h-1.5 w-1.5 rounded-full" />
          <div className="bg-primary/50 h-1.5 w-1.5 rounded-full" />
          <div className="bg-primary/30 h-1.5 w-1.5 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
