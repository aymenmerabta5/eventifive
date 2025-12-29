import {
  IconBuilding,
  IconFlask,
  IconMail,
  IconCalendar,
} from "@tabler/icons-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/string";
import { formatDateLong } from "@/lib/date";
import type { UserData } from "../types";

interface HeroSectionProps {
  user: UserData;
}

export function HeroSection({ user }: HeroSectionProps) {
  const initials = getInitials(user.name);
  const profileImageUrl = user.imageUrl || user.image;

  return (
    <Card className="border-border/60 from-primary/10 via-background to-background relative overflow-hidden rounded-3xl bg-linear-to-br shadow-xl">
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary/15 absolute -top-32 -left-20 h-72 w-72 rounded-full blur-3xl" />
        <div className="bg-primary/10 absolute top-10 right-0 h-60 w-60 rounded-full blur-3xl" />
        <div className="bg-primary/20 absolute bottom-0 left-10 h-32 w-32 rounded-full blur-2xl" />
      </div>

      <CardContent className="relative space-y-8 p-8 sm:p-10 lg:p-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="flex items-start gap-6">
            <div className="group relative shrink-0">
              <div className="from-primary/40 via-primary/20 absolute -inset-2 rounded-full bg-linear-to-br to-transparent opacity-70 blur-2xl transition duration-500 group-hover:opacity-100" />
              <Avatar className="ring-background relative h-28 w-28 shadow-2xl ring-4 sm:h-32 sm:w-32">
                {profileImageUrl && (
                  <AvatarImage
                    src={profileImageUrl}
                    alt={user.name}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="from-primary to-primary/70 text-primary-foreground bg-linear-to-br text-3xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-foreground text-3xl leading-tight font-semibold sm:text-4xl">
                  {user.name}
                </h1>
              </div>

              <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
                {user.researchDomain && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary gap-2 rounded-full px-3 py-1"
                  >
                    <IconFlask className="h-4 w-4" />
                    {user.researchDomain}
                  </Badge>
                )}
                {user.institution && (
                  <Badge
                    variant="secondary"
                    className="bg-background/60 text-muted-foreground gap-2 rounded-full px-3 py-1"
                  >
                    <IconBuilding className="text-primary h-4 w-4" />
                    {user.institution}
                  </Badge>
                )}
                {user.isOwnProfile && (
                  <Badge
                    variant="secondary"
                    className="bg-background/60 text-muted-foreground gap-2 rounded-full px-3 py-1"
                  >
                    <IconCalendar className="text-primary h-4 w-4" />
                    Member since {formatDateLong(user.createdAt)}
                  </Badge>
                )}
              </div>

              {user.isOwnProfile && user.email && (
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                    <IconMail className="h-4 w-4" />
                  </div>
                  <a
                    href={`mailto:${user.email}`}
                    className="hover:text-foreground wrap-break-word transition-colors"
                  >
                    {user.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
