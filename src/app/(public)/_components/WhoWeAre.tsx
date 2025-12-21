"use client";

import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export default function WhoWeAre() {
  return (
    <div className="from-background via-background to-secondary/30 dark:from-background dark:via-background dark:to-background bg-linear-to-b">
      <ul className="grid grid-cols-1 grid-rows-none gap-4 px-20 py-50 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:grid-rows-2">
        <GridItem
          area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
          icon={
            <Box className="text-foreground dark:text-muted-foreground h-4 w-4" />
          }
          title="Seamless Event Planning"
          description="Create, manage, and organize events effortlessly with our intuitive platform. From small gatherings to large conferences, we've got you covered."
        />

        <GridItem
          area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
          icon={
            <Settings className="text-foreground dark:text-muted-foreground h-4 w-4" />
          }
          title="Smart Event Management"
          description="Customize every aspect of your event with powerful tools. Manage schedules, speakers, venues, and attendees all in one place."
        />

        <GridItem
          area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
          icon={
            <Lock className="text-foreground dark:text-muted-foreground h-4 w-4" />
          }
          title="Secure & Reliable"
          description="Your event data is protected with enterprise-grade security. Trust us to keep your attendee information safe and compliant with privacy regulations."
        />

        <GridItem
          area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
          icon={
            <Sparkles className="text-foreground dark:text-muted-foreground h-4 w-4" />
          }
          title="Real-Time Updates"
          description="Keep your attendees informed with instant notifications. Share updates, changes, and important announcements as they happen."
        />

        <GridItem
          area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
          icon={
            <Search className="text-foreground dark:text-muted-foreground h-4 w-4" />
          }
          title="Discover Amazing Events"
          description="Browse and find events that match your interests. Connect with like-minded people and create memorable experiences together."
        />
      </ul>
    </div>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={`min-h-56 list-none ${area}`}>
      <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="border-border w-fit rounded-lg border p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="-tracking-4 text-foreground dark:text-foreground pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance md:text-2xl/[1.875rem]">
                {title}
              </h3>
              <h2 className="text-foreground/80 dark:text-muted-foreground font-sans text-sm/[1.125rem] md:text-base/[1.375rem] [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                {description}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
