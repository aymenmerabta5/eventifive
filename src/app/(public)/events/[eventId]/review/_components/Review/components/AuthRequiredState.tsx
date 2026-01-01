import type { Route } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, LogIn } from "lucide-react";

export function AuthRequiredState() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl" />
        <div className="bg-secondary/20 absolute -bottom-40 -left-40 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-accent/10 absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-[70vh] items-center justify-center px-4 py-12">
        <Card className="border-border/60 bg-card/80 w-full max-w-lg overflow-hidden backdrop-blur-sm">
          {/* Top decorative gradient bar */}
          <div className="from-primary via-primary/80 to-secondary h-1 w-full bg-gradient-to-r" />

          <CardContent className="flex flex-col items-center gap-6 px-6 py-10 text-center sm:px-10">
            {/* Icon container */}
            <div className="relative">
              <div className="bg-primary/10 absolute inset-0 scale-150 rounded-full blur-xl" />
              <div className="border-primary/20 bg-primary/10 relative flex h-16 w-16 items-center justify-center rounded-2xl border">
                <Lock className="text-primary h-8 w-8" />
              </div>
            </div>

            {/* Text content */}
            <div className="space-y-2">
              <h2 className="font-display text-foreground text-xl font-semibold tracking-tight">
                Authentication Required
              </h2>
              <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                You must be signed in as a reviewer to access and review
                submissions.
              </p>
            </div>

            {/* Sign in button */}
            <Button asChild className="gap-2">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                Sign in to continue
              </Link>
            </Button>

            {/* Decorative footer */}
            <p className="text-muted-foreground/60 text-xs">
              Don&apos;t have an account?{" "}
              <Link
                href={"/signup" as Route}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
