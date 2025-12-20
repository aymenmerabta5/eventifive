import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";

interface AuthFormContainerProps {
  children: ReactNode;
}

export function AuthFormContainer({ children }: AuthFormContainerProps) {
  return (
    <div className="mt-12 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg">
        <div
          className="absolute inset-0 -z-10 rounded-xl opacity-10 blur-3xl dark:opacity-40"
          style={{
            background: "oklch(var(--primary))",
            transform: "scale(1.15)",
          }}
        />
        <Card className="border-primary/20 dark:border-primary/40 bg-card/95 relative w-full p-8 shadow-lg backdrop-blur-md dark:shadow-[0_0_60px_rgba(139,92,246,0.5),0_0_120px_rgba(139,92,246,0.3),0_25px_80px_rgba(0,0,0,0.2),0_10px_30px_rgba(0,0,0,0.3)]">
          {children}
        </Card>
      </div>
    </div>
  );
}
