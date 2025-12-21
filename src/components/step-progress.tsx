import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type StepProgressStep = {
  key: string;
  label: string;
  description?: string;
};

type Props = {
  steps: StepProgressStep[];
  currentKey: StepProgressStep["key"];
  className?: string;
};

function getIndex(steps: StepProgressStep[], key: string) {
  const idx = steps.findIndex((s) => s.key === key);
  return idx < 0 ? 0 : idx;
}

export function StepProgress({ steps, currentKey, className }: Props) {
  const currentIndex = getIndex(steps, currentKey);

  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center gap-2">
        {steps.map((step, idx) => {
          const isComplete = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <li key={step.key} className="flex flex-1 items-center gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={cn(
                    "grid size-9 place-items-center rounded-full border text-sm font-semibold",
                    isComplete &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-primary/10 text-primary",
                    !isComplete &&
                      !isCurrent &&
                      "border-border bg-muted text-muted-foreground",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? <Check className="size-4" /> : idx + 1}
                </div>
                <div className="min-w-0">
                  <div
                    className={cn(
                      "truncate text-sm font-medium",
                      isCurrent ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </div>
                  {step.description ? (
                    <div className="text-muted-foreground hidden truncate text-xs md:block">
                      {step.description}
                    </div>
                  ) : null}
                </div>
              </div>

              {idx !== steps.length - 1 ? (
                <div
                  aria-hidden="true"
                  className={cn(
                    "h-[2px] flex-1 rounded-full",
                    idx < currentIndex ? "bg-primary" : "bg-border",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
