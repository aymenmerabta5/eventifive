"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface AuthFormContainerProps {
  children: ReactNode;
}

export function AuthFormContainer({ children }: AuthFormContainerProps) {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
      <motion.div
        className="relative w-full max-w-sm sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Ambient glow effect */}
        <div className="bg-primary pointer-events-none absolute -inset-3 -z-10 rounded-2xl opacity-[0.03] blur-xl dark:opacity-[0.08]" />

        {/* Main card */}
        <div className="border-border/40 bg-card/90 dark:border-border/20 dark:bg-card/70 relative rounded-xl border p-6 shadow-lg backdrop-blur-xl sm:p-8 dark:shadow-xl">
          {/* Subtle inner glow on top edge */}
          <div className="via-primary/15 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />

          {/* Content */}
          <div className="relative">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}
