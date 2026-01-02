"use client";

import {
  IconBuilding,
  IconFlask,
  IconMail,
  IconCalendar,
  IconShare,
  IconMessage,
  IconSettings,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/string";
import { formatDateLong } from "@/lib/date";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { UserData } from "../types";

interface HeroSectionProps {
  user: UserData;
  isContacting?: boolean;
  onContact?: () => void;
  onShare?: () => void;
}

export function HeroSection({
  user,
  isContacting,
  onContact,
  onShare,
}: HeroSectionProps) {
  const initials = getInitials(user.name);
  const profileImageUrl = user.imageUrl || user.image;
  const isOwnProfile = user.isOwnProfile;

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient with animated blobs */}
      <div className="from-primary/15 via-background to-background absolute inset-0 bg-gradient-to-br">
        <div className="bg-primary/20 absolute -top-24 -left-24 size-96 animate-pulse rounded-full blur-3xl" />
        <div className="bg-primary/10 absolute top-20 right-0 size-80 rounded-full blur-3xl" />
        <div className="bg-primary/15 absolute -bottom-20 left-1/3 size-64 rounded-full blur-3xl" />
      </div>

      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
            {/* Avatar Section */}
            <div className="group relative shrink-0">
              {/* Glow effect */}
              <div className="from-primary/40 via-primary/20 absolute -inset-4 rounded-full bg-gradient-to-br to-transparent opacity-60 blur-2xl transition-all duration-500 group-hover:scale-110 group-hover:opacity-100" />

              {/* Ring decoration */}
              <div className="border-primary/20 absolute -inset-2 animate-pulse rounded-full border-2" />
              <div className="border-primary/10 absolute -inset-3 rounded-full border" />

              <Avatar className="ring-background relative size-36 shadow-2xl ring-4 sm:size-44">
                {profileImageUrl && (
                  <AvatarImage
                    src={profileImageUrl}
                    alt={user.name}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="from-primary to-primary/70 text-primary-foreground bg-gradient-to-br text-4xl font-bold sm:text-5xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Verified badge overlay */}
              {isOwnProfile && user.emailVerified && (
                <div className="ring-background absolute -right-1 -bottom-1 flex size-10 items-center justify-center rounded-full bg-emerald-500 shadow-lg ring-4">
                  <IconShieldCheck className="size-5 text-white" />
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex-1 text-center lg:text-left">
              {/* Name and verified status */}
              <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-center">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {user.name}
                </h1>
                {isOwnProfile && user.emailVerified && (
                  <Badge className="gap-1.5 border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <IconShieldCheck className="size-3.5" />
                    Verified
                  </Badge>
                )}
              </div>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                {user.researchDomain && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 gap-2 rounded-full px-4 py-1.5"
                  >
                    <IconFlask className="size-4" />
                    {user.researchDomain}
                  </Badge>
                )}
                {user.institution && (
                  <Badge
                    variant="secondary"
                    className="bg-muted/80 border-border/50 gap-2 rounded-full px-4 py-1.5"
                  >
                    <IconBuilding className="text-primary size-4" />
                    {user.institution}
                  </Badge>
                )}
              </div>

              {/* Member since & email */}
              <div className="text-muted-foreground mt-4 flex flex-wrap items-center justify-center gap-4 text-sm lg:justify-start">
                {isOwnProfile && (
                  <div className="flex items-center gap-2">
                    <div className="bg-muted/50 flex size-8 items-center justify-center rounded-lg">
                      <IconCalendar className="text-primary size-4" />
                    </div>
                    <span>Member since {formatDateLong(user.createdAt)}</span>
                  </div>
                )}
                {isOwnProfile && user.email && (
                  <div className="flex items-center gap-2">
                    <div className="bg-muted/50 flex size-8 items-center justify-center rounded-lg">
                      <IconMail className="text-primary size-4" />
                    </div>
                    <a
                      href={`mailto:${user.email}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {user.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                {isOwnProfile ? (
                  <>
                    <Button
                      asChild
                      className="shadow-primary/20 gap-2 rounded-full px-6 shadow-lg"
                    >
                      <Link href="/settings">
                        <IconSettings className="size-4" />
                        Edit Profile
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 rounded-full px-6"
                      onClick={onShare}
                    >
                      <IconShare className="size-4" />
                      Share Profile
                    </Button>
                  </>
                ) : (
                  <>
                    {onContact && (
                      <Button
                        className="shadow-primary/20 gap-2 rounded-full px-6 shadow-lg"
                        onClick={onContact}
                        disabled={isContacting}
                      >
                        {isContacting ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Opening chat...
                          </>
                        ) : (
                          <>
                            <IconMessage className="size-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="gap-2 rounded-full px-6"
                      onClick={onShare}
                    >
                      <IconShare className="size-4" />
                      Share
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Stats Cards (only for own profile) */}
            {isOwnProfile &&
              user.recentEvents &&
              user.recentEvents.length > 0 && (
                <div className="hidden flex-col gap-3 xl:flex">
                  <StatCard
                    label="Events"
                    value={user.recentEvents.length}
                    icon={IconCalendar}
                    color="text-primary"
                    bgColor="bg-primary/10"
                  />
                  <StatCard
                    label="Activity"
                    value={
                      user.recentEvents.filter((e) => e.status === "upcoming")
                        .length
                    }
                    icon={IconSparkles}
                    color="text-amber-500"
                    bgColor="bg-amber-500/10"
                  />
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: number;
  icon: typeof IconCalendar;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <div className="border-border/50 bg-card/80 flex items-center gap-3 rounded-xl border px-4 py-3 backdrop-blur-sm">
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-xl",
          bgColor,
        )}
      >
        <Icon className={cn("size-5", color)} />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-muted-foreground text-xs">{label}</p>
      </div>
    </div>
  );
}
