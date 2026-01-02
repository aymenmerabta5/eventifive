"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FormFooterProps {
  onSwitchToSignUp: () => void;
}

export function FormFooter({ onSwitchToSignUp }: FormFooterProps) {
  return (
    <motion.div
      className="mt-6 space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      {/* Switch to sign up */}
      <div className="flex items-center justify-center gap-1 text-sm">
        <span className="text-muted-foreground">
          Don&apos;t have an account?
        </span>
        <Button
          variant="link"
          onClick={onSwitchToSignUp}
          className="text-primary hover:text-primary/80 h-auto p-0 font-semibold"
        >
          Sign up
        </Button>
      </div>

      {/* Forgot password link */}
      <div className="flex justify-center">
        <Button
          variant="link"
          asChild
          className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs"
        >
          <Link href="/reset-password">Forgot your password?</Link>
        </Button>
      </div>

      {/* Back to home - only on mobile/tablet */}
      <div className="flex justify-center pt-2 lg:hidden">
        <Button
          variant="link"
          asChild
          className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs"
        >
          <Link href="/">← Back to home</Link>
        </Button>
      </div>
    </motion.div>
  );
}
