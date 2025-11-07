"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { User, Mail } from "lucide-react";

export default function Main() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="relative w-full max-w-2xl">
        <div
          className="absolute inset-0 -z-10 rounded-xl opacity-10 blur-3xl dark:opacity-40"
          style={{
            background: "oklch(var(--primary))",
            transform: "scale(1.15)",
          }}
        />
        <Card className="border-primary/20 dark:border-primary/40 bg-card/95 relative w-full p-8 shadow-lg backdrop-blur-md dark:shadow-[0_0_60px_rgba(139,92,246,0.5),0_0_120px_rgba(139,92,246,0.3),0_25px_80px_rgba(0,0,0,0.2),0_10px_30px_rgba(0,0,0,0.3)]">
          <CardHeader className="text-center pb-6">
            <Skeleton className="h-7 w-32 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="border-t border-border"></div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-6 border-t">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }
  const user = session?.user;
  const name = user?.name || "Guest User";
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div className="relative w-full max-w-2xl">
      <div
        className="absolute inset-0 -z-10 rounded-xl opacity-10 blur-3xl dark:opacity-40"
        style={{
          background: "oklch(var(--primary))",
          transform: "scale(1.15)",
        }}
      />
      <Card className="border-primary/20 dark:border-primary/40 bg-card/95 relative w-full p-8 shadow-lg backdrop-blur-md dark:shadow-[0_0_60px_rgba(139,92,246,0.5),0_0_120px_rgba(139,92,246,0.3),0_25px_80px_rgba(0,0,0,0.2),0_10px_30px_rgba(0,0,0,0.3)]">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
          <CardDescription className="text-base mt-2">
            Manage your account information and settings
          </CardDescription>
        </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold shadow-lg ring-4 ring-background">
              {initials}
            </div>
            <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-green-500 border-2 border-background"></div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">{name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{user?.email || "Not logged in"}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border"></div>

        {/* Profile Information */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              <User className="size-4" />
              Full Name
            </Label>
            <Input
              id="name"
              disabled={true}
              type="text"
              value={user?.name || ""}
              placeholder="Not available"
              className="w-full bg-muted/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
              <Mail className="size-4" />
              Email Address
            </Label>
            <Input
              id="email"
              disabled={true}
              type="email"
              value={user?.email || ""}
              placeholder="Not available"
              className="w-full bg-muted/50"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-6 border-t">
        <Button variant="default" className="w-full" size="lg">
          Update Profile
        </Button>
        <Button variant="destructive" className="w-full" size="lg">
          Delete Account
        </Button>
      </CardFooter>
      </Card>
    </div>
  );
}
