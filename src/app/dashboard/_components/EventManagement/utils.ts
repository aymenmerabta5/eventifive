export * from '@/lib/utils';

// Returns Tailwind classes for a given badge variant
export function getStatusStyles(variant: string): string {
  switch (variant) {
    case "default":
      return "bg-primary/10 text-primary border-primary/30";
    case "secondary":
      return "bg-secondary text-secondary-foreground border-secondary";
    case "destructive":
      return "bg-destructive/10 text-destructive border-destructive/30";
    case "outline":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-secondary text-secondary-foreground border-secondary";
  }
}