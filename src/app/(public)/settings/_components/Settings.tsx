"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import Avatar from "./Avatar";
import type { User as BetterAuthUser } from "better-auth";
import ProfileInfo from "./ProfileInfo";
import ChangeEmail from "./ChangeEmail";
import ChangePassword from "./ChangePassword";

export default function Main() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="relative w-full max-w-4xl">
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
  

  return (
    <div className="relative w-full max-w-4xl">
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
        <Avatar user={session?.user as unknown as BetterAuthUser} isPending={isPending} />

        {/* Divider */}
        <div className="border-t border-border"></div>

        {/* Profile Information */}
        <ProfileInfo user={session?.user as unknown as BetterAuthUser} />
        <ChangeEmail user={session?.user as unknown as BetterAuthUser} />
        <ChangePassword />
      </CardContent>
      </Card>
    </div>
  );
}
