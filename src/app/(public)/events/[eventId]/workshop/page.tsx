"use client";

import { useParams } from "next/navigation";
import { WorkshopStatusView } from "./_components/WorkshopStatusView";

export default function WorkshopPage() {
  const params = useParams<{ eventType: string; eventId: string }>();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0">
        {/* Large gradient orb - top right */}
        <div className="animate-pulse-slow from-primary/20 via-primary/10 absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br to-transparent blur-3xl" />

        {/* Medium gradient orb - bottom left */}
        <div className="animate-pulse-slow from-secondary/30 via-accent/20 absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tr to-transparent blur-3xl [animation-delay:1s]" />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating geometric shapes */}
        <div className="border-primary/20 absolute top-1/4 left-[10%] h-3 w-3 rotate-45 border-2 opacity-60" />
        <div className="border-secondary/30 absolute top-1/3 right-[15%] h-4 w-4 rounded-full border-2" />
        <div className="bg-primary/10 absolute bottom-1/4 left-[20%] h-2 w-8 rounded-full" />
        <div className="border-accent/20 absolute top-2/3 right-[10%] h-6 w-6 rotate-12 rounded-lg border" />
      </div>

      {/* Main content - conditionally shows form, pending, rejected, or manage view */}
      <WorkshopStatusView
        eventId={params.eventId}
        eventType={params.eventType}
      />
    </div>
  );
}
