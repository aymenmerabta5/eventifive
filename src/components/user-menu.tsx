import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconSettings,
  IconLogout,
  IconUser,
  IconMail,
  IconAward,
  IconMicrophone,
  IconTicket,
  IconChevronRight,
  IconClipboardList,
} from "@tabler/icons-react";

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (!session) {
    return (
      <Button variant="outline" className="rounded-full px-6" asChild>
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="hover:ring-primary/30 hover:ring-offset-background focus-visible:ring-primary/40 relative size-9 rounded-full p-0 transition-all duration-200 hover:ring-2 hover:ring-offset-1 focus-visible:ring-2"
        >
          <Avatar className="size-9">
            <AvatarImage
              src={session.user.profileImageUrl ?? undefined}
              alt={session.user.name || ""}
              className="object-cover"
            />
            <AvatarFallback className="from-primary to-primary/80 text-primary-foreground bg-gradient-to-br text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="border-border/50 bg-card/95 w-72 overflow-hidden rounded-2xl p-0 shadow-xl backdrop-blur-xl"
        align="end"
        sideOffset={8}
        forceMount
      >
        {/* Header Section */}
        <div className="from-primary/10 via-primary/5 relative overflow-hidden bg-gradient-to-br to-transparent p-4">
          {/* Subtle decorative element */}
          <div className="bg-primary/10 absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl" />
          <div className="bg-primary/5 absolute -bottom-4 -left-4 h-16 w-16 rounded-full blur-xl" />

          <div className="relative flex items-center gap-4">
            <Avatar className="ring-primary/20 ring-offset-card h-14 w-14 ring-2 ring-offset-2">
              <AvatarImage
                src={session.user.profileImageUrl ?? undefined}
                alt={session.user.name || ""}
                className="object-cover"
              />
              <AvatarFallback className="from-primary to-primary/80 text-primary-foreground bg-gradient-to-br text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate font-semibold">
                {session.user.name}
              </p>
              <p className="text-muted-foreground truncate text-sm">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-border/50 m-0" />

        {/* Navigation Section */}
        <div className="p-2">
          <p className="text-muted-foreground/70 px-2 py-1.5 text-xs font-medium tracking-wider uppercase">
            Account
          </p>

          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link
                href={`/users/${session.user.id}` as Route}
                className="group hover:bg-primary/10 focus:bg-primary/10 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
              >
                <div className="bg-muted/50 group-hover:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                  <IconUser className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                </div>
                <span className="flex-1 font-medium">View Profile</span>
                <IconChevronRight className="text-muted-foreground/50 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/settings"
                className="group hover:bg-primary/10 focus:bg-primary/10 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
              >
                <div className="bg-muted/50 group-hover:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                  <IconSettings className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                </div>
                <span className="flex-1 font-medium">Settings</span>
                <IconChevronRight className="text-muted-foreground/50 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </div>

        <DropdownMenuSeparator className="bg-border/50 mx-2" />

        {/* Activity Section */}
        <div className="p-2">
          <p className="text-muted-foreground/70 px-2 py-1.5 text-xs font-medium tracking-wider uppercase">
            Activity
          </p>

          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link
                href="/invites"
                className="group hover:bg-primary/10 focus:bg-primary/10 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
              >
                <div className="bg-muted/50 group-hover:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                  <IconMail className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                </div>
                <span className="flex-1 font-medium">Invites</span>
                <IconChevronRight className="text-muted-foreground/50 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/registrations"
                className="group hover:bg-primary/10 focus:bg-primary/10 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
              >
                <div className="bg-muted/50 group-hover:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                  <IconTicket className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                </div>
                <span className="flex-1 font-medium">My Registrations</span>
                <IconChevronRight className="text-muted-foreground/50 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href={"/my-applications" as Route}
                className="group hover:bg-primary/10 focus:bg-primary/10 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
              >
                <div className="bg-muted/50 group-hover:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                  <IconClipboardList className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                </div>
                <span className="flex-1 font-medium">My Applications</span>
                <IconChevronRight className="text-muted-foreground/50 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href={"/certificates" as Route}
                className="group hover:bg-primary/10 focus:bg-primary/10 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
              >
                <div className="bg-muted/50 group-hover:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                  <IconAward className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                </div>
                <span className="flex-1 font-medium">My Certificates</span>
                <IconChevronRight className="text-muted-foreground/50 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href={"/sessions" as Route}
                className="group hover:bg-primary/10 focus:bg-primary/10 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
              >
                <div className="bg-muted/50 group-hover:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                  <IconMicrophone className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                </div>
                <span className="flex-1 font-medium">My Sessions</span>
                <IconChevronRight className="text-muted-foreground/50 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </div>

        <DropdownMenuSeparator className="bg-border/50 mx-2" />

        {/* Logout Section */}
        <div className="p-2">
          <DropdownMenuItem
            className="group hover:bg-destructive/10 focus:bg-destructive/10 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push("/");
                  },
                },
              });
            }}
          >
            <div className="bg-muted/50 group-hover:bg-destructive/20 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
              <IconLogout className="text-muted-foreground group-hover:text-destructive h-4 w-4 transition-colors" />
            </div>
            <span className="group-hover:text-destructive flex-1 font-medium transition-colors">
              Log out
            </span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
