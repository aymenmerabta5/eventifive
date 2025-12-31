"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface FormSectionProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "highlight" | "subtle";
  action?: ReactNode;
}

export function FormSection({
  icon,
  title,
  description,
  children,
  className,
  variant = "default",
  action,
}: FormSectionProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-300",
        variant === "default" &&
          "border-border/60 bg-card shadow-sm hover:shadow-md hover:border-border",
        variant === "highlight" &&
          "border-primary/20 bg-gradient-to-br from-primary/[0.02] to-primary/[0.06] shadow-sm hover:shadow-md hover:border-primary/30",
        variant === "subtle" &&
          "border-border/40 bg-muted/30 hover:bg-muted/50",
        className,
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-60 dark:from-white/5" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-border/40 px-6 py-5">
          {icon && (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>

        {/* Content */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

interface FormGroupProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3;
}

export function FormGroup({
  children,
  className,
  columns = 1,
}: FormGroupProps) {
  return (
    <div
      className={cn(
        "grid gap-5",
        columns === 2 && "md:grid-cols-2",
        columns === 3 && "md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface FormFieldWrapperProps {
  children: ReactNode;
  className?: string;
}

export function FormFieldWrapper({
  children,
  className,
}: FormFieldWrapperProps) {
  return (
    <div
      className={cn(
        "group/field space-y-1.5 rounded-xl bg-muted/30 px-4 py-3 ring-1 ring-border/50 transition-all focus-within:bg-muted/50 focus-within:ring-primary/30",
        className,
      )}
    >
      {children}
    </div>
  );
}
