"use client";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { IconPlus, IconCalendarEvent, IconSparkles } from "@tabler/icons-react";
import Link from "next/link";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getTimeOfDayEmoji(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 20) return "evening";
  return "night";
}

export function WelcomeSection() {
  const { data: session, isPending } = authClient.useSession();
  const greeting = getGreeting();
  const timeOfDay = getTimeOfDayEmoji();

  if (isPending) {
    return <WelcomeSkeleton />;
  }

  const firstName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="relative overflow-hidden px-4 lg:px-6">
      {/* Main welcome card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "from-primary/5 via-card to-secondary/10 bg-gradient-to-br",
          "border-border/50 border shadow-sm",
          "hover:shadow-primary/5 transition-all duration-500 hover:shadow-md",
        )}
      >
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Gradient orbs */}
          <div
            className={cn(
              "absolute -top-20 -right-20 size-64 rounded-full blur-3xl",
              "from-primary/20 via-chart-2/15 bg-gradient-to-br to-transparent",
              "animate-pulse-slow",
            )}
          />
          <div
            className={cn(
              "absolute -bottom-16 -left-16 size-48 rounded-full blur-3xl",
              "from-chart-3/15 via-secondary/10 bg-gradient-to-tr to-transparent",
              "animate-pulse-slow",
              "animation-delay-1000",
            )}
          />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          {/* Left side - Greeting */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {timeOfDay === "morning" && (
                <span className="text-2xl" role="img" aria-label="sun">
                  &#9728;&#65039;
                </span>
              )}
              {timeOfDay === "afternoon" && (
                <span className="text-2xl" role="img" aria-label="sun">
                  &#127774;
                </span>
              )}
              {timeOfDay === "evening" && (
                <span className="text-2xl" role="img" aria-label="sunset">
                  &#127751;
                </span>
              )}
              {timeOfDay === "night" && (
                <span className="text-2xl" role="img" aria-label="moon">
                  &#127769;
                </span>
              )}
              <h1 className="font-display text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                {greeting}, {firstName}
              </h1>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">
              Here&apos;s what&apos;s happening with your events today
            </p>
          </div>

          {/* Right side - Quick actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              variant="outline"
              className={cn(
                "group border-border/50 bg-card/50 gap-2 rounded-xl",
                "hover:border-primary/50 hover:bg-primary/5",
                "transition-all duration-300",
              )}
            >
              <Link href="/events">
                <IconCalendarEvent className="text-muted-foreground group-hover:text-primary size-4 transition-colors" />
                <span>Browse Events</span>
              </Link>
            </Button>
            <Button
              asChild
              className={cn(
                "group gap-2 rounded-xl",
                "from-primary to-chart-1 bg-gradient-to-r",
                "shadow-primary/25 shadow-md",
                "hover:shadow-primary/30 hover:shadow-lg",
                "transition-all duration-300 hover:-translate-y-0.5",
              )}
            >
              <Link href="/dashboard?view=add-event">
                <IconPlus className="size-4" />
                <span>Create Event</span>
                <IconSparkles className="size-3.5 opacity-70" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeSkeleton() {
  return (
    <div className="px-4 lg:px-6">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "from-muted/30 via-card to-muted/20 bg-gradient-to-br",
          "border-border/50 border",
        )}
      >
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-8 w-48 sm:w-64" />
            </div>
            <Skeleton className="h-4 w-64 sm:w-80" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
