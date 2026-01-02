"use client";

import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { Button } from "@/components/ui/button";

interface SocialSignInProps {
  isPending: boolean;
  onSignIn: () => void;
}

export function SocialSignIn({ isPending, onSignIn }: SocialSignInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      {/* Divider with "Or" text */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="border-border/50 w-full border-t" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card text-muted-foreground px-3 text-xs font-medium tracking-wider uppercase">
            Or
          </span>
        </div>
      </div>

      {/* Google sign-in button */}
      <Button
        type="button"
        variant="outline"
        className="group border-border/50 bg-background/50 hover:border-primary/30 hover:bg-background relative h-10 w-full overflow-hidden rounded-lg transition-all duration-200"
        onClick={onSignIn}
        disabled={isPending}
      >
        {/* Hover gradient effect */}
        <span className="bg-primary/5 pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <span className="relative flex items-center justify-center gap-3">
          {isPending ? (
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          ) : (
            <SiGoogle className="size-5" />
          )}
          <span className="font-medium">
            {isPending ? "Connecting..." : "Continue with Google"}
          </span>
        </span>
      </Button>
    </motion.div>
  );
}
