"use client";

import { motion } from "motion/react";
import { Calendar, Sparkles, Users, Star, Zap } from "lucide-react";

function FloatingShape({
  className,
  delay = 0,
  children,
}: {
  className?: string;
  delay?: number;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: [0, -15, 0],
      }}
      transition={{
        opacity: { duration: 0.8, delay },
        y: {
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay,
        },
      }}
    >
      {children}
    </motion.div>
  );
}

function DecorativePanel() {
  return (
    <div className="relative hidden h-full overflow-hidden lg:block">
      {/* Base gradient background - darker for dark mode */}
      <div className="from-background via-card to-background dark:via-background absolute inset-0 bg-gradient-to-br dark:from-black dark:to-black" />

      {/* Subtle primary accent overlay - reduced in dark mode */}
      <div className="from-primary/20 via-primary/10 dark:from-primary/10 dark:via-primary/5 absolute inset-0 bg-gradient-to-br to-transparent dark:to-transparent" />

      {/* Animated mesh gradient overlay - dimmer in dark mode */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="bg-primary/20 dark:bg-primary/15 absolute -top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full blur-3xl" />
        <div className="bg-secondary/30 dark:bg-secondary/20 absolute -right-1/4 -bottom-1/4 h-[500px] w-[500px] rounded-full blur-3xl" />
        <div className="bg-accent/15 dark:bg-accent/10 absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      </div>

      {/* Geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-12">
        {/* Logo and tagline */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="border-border/30 bg-card/50 dark:border-border/15 dark:bg-card/30 flex size-10 items-center justify-center rounded-xl border backdrop-blur-sm">
              <Calendar className="text-primary dark:text-primary/80 size-5" />
            </div>
            <span className="font-display text-foreground text-xl font-bold tracking-tight">
              Eventifive
            </span>
          </div>
          <p className="text-muted-foreground max-w-xs text-sm">
            Create memorable experiences with our event management platform
          </p>
        </motion.div>

        {/* Floating decorative elements */}
        <div className="relative flex-1">
          <FloatingShape
            delay={0}
            className="border-border/20 bg-card/30 dark:border-border/10 dark:bg-card/20 absolute top-[15%] left-[10%] flex size-12 items-center justify-center rounded-xl border backdrop-blur-sm"
          >
            <Sparkles className="text-primary/70 dark:text-primary/50 size-5" />
          </FloatingShape>

          <FloatingShape
            delay={0.5}
            className="border-border/20 bg-card/30 dark:border-border/10 dark:bg-card/20 absolute top-[35%] right-[15%] flex size-14 items-center justify-center rounded-2xl border backdrop-blur-sm"
          >
            <Users className="text-primary/70 dark:text-primary/50 size-6" />
          </FloatingShape>

          <FloatingShape
            delay={1}
            className="border-border/20 bg-card/30 dark:border-border/10 dark:bg-card/20 absolute bottom-[30%] left-[20%] flex size-10 items-center justify-center rounded-lg border backdrop-blur-sm"
          >
            <Star className="text-primary/70 dark:text-primary/50 size-4" />
          </FloatingShape>

          <FloatingShape
            delay={1.5}
            className="border-border/20 bg-card/30 dark:border-border/10 dark:bg-card/20 absolute right-[25%] bottom-[15%] flex size-10 items-center justify-center rounded-xl border backdrop-blur-sm"
          >
            <Zap className="text-primary/70 dark:text-primary/50 size-4" />
          </FloatingShape>

          {/* Decorative rings */}
          <motion.div
            className="border-border/10 absolute top-1/2 left-1/2 size-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          />
          <motion.div
            className="border-border/5 absolute top-1/2 left-1/2 size-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>

        {/* Bottom stats */}
        <motion.div
          className="grid grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="border-border/30 bg-card/30 dark:border-border/15 dark:bg-card/20 rounded-xl border p-3 backdrop-blur-sm">
            <div className="font-display text-foreground text-xl font-bold">
              500+
            </div>
            <div className="text-muted-foreground text-xs">Events Created</div>
          </div>
          <div className="border-border/30 bg-card/30 dark:border-border/15 dark:bg-card/20 rounded-xl border p-3 backdrop-blur-sm">
            <div className="font-display text-foreground text-xl font-bold">
              10K+
            </div>
            <div className="text-muted-foreground text-xs">Attendees</div>
          </div>
          <div className="border-border/30 bg-card/30 dark:border-border/15 dark:bg-card/20 rounded-xl border p-3 backdrop-blur-sm">
            <div className="font-display text-foreground text-xl font-bold">
              98%
            </div>
            <div className="text-muted-foreground text-xs">Satisfaction</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid h-svh lg:grid-cols-2">
      {/* Left decorative panel */}
      <DecorativePanel />

      {/* Right form panel */}
      <div className="bg-background relative flex items-center justify-center overflow-y-auto">
        {/* Subtle gradient background */}
        <div className="from-primary/[0.02] to-primary/[0.01] pointer-events-none absolute inset-0 bg-linear-to-br via-transparent" />

        {/* Decorative blur elements for mobile/tablet */}
        <div className="bg-primary/10 dark:bg-primary/5 pointer-events-none absolute -top-32 -right-32 size-64 rounded-full blur-3xl lg:hidden" />
        <div className="bg-primary/5 dark:bg-primary/[0.03] pointer-events-none absolute -bottom-32 -left-32 size-64 rounded-full blur-3xl lg:hidden" />

        {/* Form content */}
        <div className="relative z-10 w-full">{children}</div>
      </div>
    </div>
  );
}
