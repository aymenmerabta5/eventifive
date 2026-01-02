"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FormFooter() {
  return (
    <motion.div
      className="mt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center justify-center gap-1 text-sm">
        <span className="text-muted-foreground">Remember your password?</span>
        <Button
          variant="link"
          asChild
          className="text-primary hover:text-primary/80 h-auto p-0 font-semibold"
        >
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </motion.div>
  );
}
