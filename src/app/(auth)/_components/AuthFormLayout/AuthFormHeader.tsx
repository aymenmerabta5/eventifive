import type { LucideIcon } from "lucide-react";

interface AuthFormHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  className?: string;
}

export function AuthFormHeader({
  icon: Icon,
  title,
  subtitle,
  className = "mb-8",
}: AuthFormHeaderProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Icon className="text-primary mb-3 size-8" />
      <h1 className="text-foreground font-display text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>
    </div>
  );
}
