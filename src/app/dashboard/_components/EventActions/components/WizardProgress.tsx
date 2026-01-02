"use client";

import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export type WizardStep = {
  key: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
};

interface WizardProgressProps {
  steps: WizardStep[];
  currentKey: string;
  className?: string;
}

function getIndex(steps: WizardStep[], key: string) {
  const idx = steps.findIndex((s) => s.key === key);
  return idx < 0 ? 0 : idx;
}

export function WizardProgress({
  steps,
  currentKey,
  className,
}: WizardProgressProps) {
  const currentIndex = getIndex(steps, currentKey);

  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      {/* Desktop version */}
      <div className="hidden md:block">
        <ol className="relative flex items-center justify-between">
          {/* Background line */}
          <div className="bg-border/60 absolute top-5 left-0 h-0.5 w-full" />

          {/* Progress line */}
          <motion.div
            className="from-primary via-primary to-primary/70 absolute top-5 left-0 h-0.5 bg-gradient-to-r"
            initial={{ width: "0%" }}
            animate={{
              width: `${(currentIndex / (steps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />

          {steps.map((step, idx) => {
            const isComplete = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isPending = idx > currentIndex;

            return (
              <li
                key={step.key}
                className="relative z-10 flex flex-col items-center"
              >
                <motion.div
                  className={cn(
                    "relative flex size-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isComplete &&
                      "border-primary bg-primary text-primary-foreground shadow-primary/25 shadow-lg",
                    isCurrent &&
                      "border-primary bg-card text-primary ring-primary/20 shadow-lg ring-4",
                    isPending && "border-border bg-card text-muted-foreground",
                  )}
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {isComplete ? (
                    <Check className="size-5" strokeWidth={2.5} />
                  ) : isCurrent ? (
                    <Sparkles className="size-4" />
                  ) : (
                    idx + 1
                  )}

                  {/* Pulse effect for current step */}
                  {isCurrent && (
                    <motion.div
                      className="border-primary absolute inset-0 rounded-full border-2"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  )}
                </motion.div>

                <div className="mt-3 text-center">
                  <div
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isCurrent && "text-foreground",
                      isComplete && "text-primary",
                      isPending && "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div
                      className={cn(
                        "mt-0.5 text-xs transition-colors",
                        isCurrent
                          ? "text-muted-foreground"
                          : "text-muted-foreground/60",
                      )}
                    >
                      {step.description}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Mobile version - compact pills */}
      <div className="md:hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {steps.map((step, idx) => {
            const isComplete = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <motion.div
                key={step.key}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  isComplete && "bg-primary/10 text-primary",
                  isCurrent && "bg-primary text-primary-foreground shadow-md",
                  !isComplete && !isCurrent && "bg-muted text-muted-foreground",
                )}
                animate={{ scale: isCurrent ? 1.05 : 1 }}
              >
                {isComplete ? (
                  <Check className="size-3.5" />
                ) : (
                  <span className="text-xs">{idx + 1}</span>
                )}
                <span>{step.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
