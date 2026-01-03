"use client";

import { motion } from "motion/react";
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
  className = "mb-3",
}: AuthFormHeaderProps) {
  return (
    <motion.div
      className={`flex flex-col items-center text-center ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {/* Animated icon container */}
      <motion.div
        className="bg-primary shadow-primary/20 mb-2 flex size-9 items-center justify-center rounded-lg shadow-md"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2,
        }}
      >
        <Icon className="text-primary-foreground size-4" strokeWidth={2} />
      </motion.div>

      {/* Title */}
      <h1 className="font-display text-foreground text-lg font-bold tracking-tight sm:text-xl">
        {title}
      </h1>

      {/* Subtitle */}
      <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
    </motion.div>
  );
}
