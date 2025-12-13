"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import ProfileInfo from "./ProfileInfo";
import ChangeEmail from "./ChangeEmail";
import ChangePassword from "./ChangePassword";
import SessionManagement from "./SessionManagement";
import { User, Mail, Lock, Settings, ChevronRight, Smartphone } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
    description: "Manage your personal info",
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    description: "Email & notifications",
  },
  {
    id: "security",
    label: "Security",
    icon: Lock,
    description: "Password & protection",
  },
  {
    id: "sessions",
    label: "Sessions",
    icon: Smartphone,
    description: "Manage active devices",
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Main() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  // Loading skeleton with matching design
  if (isPending || !user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 space-y-4">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-6 w-[450px]" />
        </div>

        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="h-20 w-full rounded-2xl"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
          <Skeleton className="h-[500px] w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header with gradient accent */}
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            {/* Animated icon container */}
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-2xl bg-primary/20 blur-xl" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                <Settings className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Customize your experience
              </p>
            </div>
          </div>

         
        </header>

        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          {/* Navigation Cards */}
          <nav className="space-y-3">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={cn(
                    "group relative flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all duration-300",
                    "animate-in fade-in slide-in-from-left-2",
                    isActive
                      ? "bg-card shadow-xl shadow-black/10 ring-1 ring-border/50"
                      : "hover:bg-card/50 hover:shadow-lg hover:shadow-black/5"
                  )}
                >
                  {/* Gradient border effect for active state */}
                  {isActive && (
                    <div className="absolute inset-0 -z-10 rounded-2xl bg-linear-to-r from-primary/20 via-primary/10 to-transparent" />
                  )}

                  {/* Icon with gradient background */}
                  <div
                    className={cn(
                      "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                      isActive
                        ? `bg-linear-to-br from-violet-500 to-purple-600 shadow-lg`
                        : "bg-muted group-hover:scale-105"
                    )}
                  >
                    {/* Glow effect */}
                    {isActive && (
                      <div
                        className={cn(
                          "absolute inset-0 -z-10 rounded-xl blur-xl opacity-50",
                          `bg-linear-to-br from-violet-500 to-purple-600`
                        )}
                      />
                    )}
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                  </div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        "font-semibold transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {tab.label}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {tab.description}
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <ChevronRight
                    className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive
                        ? "text-primary translate-x-0 opacity-100"
                        : "text-muted-foreground -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50"
                    )}
                  />
                </button>
              );
            })}

            {/* Decorative element below nav */}
            <Card className="mt-6 border-dashed border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Need help?{" "}
                  <Button variant="link" className="h-auto p-0 text-xs">
                    Contact support
                  </Button>
                </p>
              </CardContent>
            </Card>
          </nav>

          {/* Content Area with animation */}
          <div className="space-y-6">
            {/* Profile Tab */}
            <div
              className={cn(
                "transition-all duration-300",
                activeTab === "profile"
                  ? "animate-in fade-in slide-in-from-right-4"
                  : "hidden"
              )}
            >
              {activeTab === "profile" && (
                <Card className="overflow-hidden border-0 bg-card/80 shadow-2xl shadow-black/10 backdrop-blur-xl rounded-3xl ">
                  {/* Gradient top border */}
                  <div className={cn("h-1 w-full bg-linear-to-r from-violet-500 to-purple-600")} />

                  <CardHeader className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br shadow-lg from-violet-500 to-purple-600")}>
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold">Profile Information</CardTitle>
                        <CardDescription>
                          Update your photo and personal details
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <ProfileInfo user={user} />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Email Tab */}
            <div
              className={cn(
                "transition-all duration-300",
                activeTab === "email"
                  ? "animate-in fade-in slide-in-from-right-4"
                  : "hidden"
              )}
            >
              {activeTab === "email" && (
                <Card className="overflow-hidden border-0 bg-card/80 shadow-2xl shadow-black/10 backdrop-blur-xl rounded-3xl">
                  <div className={cn("h-1 w-full bg-linear-to-r from-violet-500 to-purple-600")} />

                  <CardHeader className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br shadow-lg from-violet-500 to-purple-600")}>
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold">Email Address</CardTitle>
                        <CardDescription>
                          Manage your email and notification preferences
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <ChangeEmail user={user} />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Security Tab */}
            <div
              className={cn(
                "transition-all duration-300",
                activeTab === "security"
                  ? "animate-in fade-in slide-in-from-right-4"
                  : "hidden"
              )}
            >
              {activeTab === "security" && (
                <Card className="overflow-hidden border-0 bg-card/80 shadow-2xl shadow-black/10 backdrop-blur-xl rounded-3xl">
                  <div className={cn("h-1 w-full bg-linear-to-r from-violet-500 to-purple-600")} />

                  <CardHeader className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br shadow-lg from-violet-500 to-purple-600")}>
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold">Security Settings</CardTitle>
                        <CardDescription>
                          Keep your account secure with a strong password
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <ChangePassword />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sessions Tab */}
            <div
              className={cn(
                "transition-all duration-300",
                activeTab === "sessions"
                  ? "animate-in fade-in slide-in-from-right-4"
                  : "hidden"
              )}
            >
              {activeTab === "sessions" && (
                <Card className="overflow-hidden border-0 bg-card/80 shadow-2xl shadow-black/10 backdrop-blur-xl rounded-3xl">
                  <div className={cn("h-1 w-full bg-linear-to-r from-violet-500 to-purple-600")} />

                  <CardHeader className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br shadow-lg from-violet-500 to-purple-600")}>
                        <Smartphone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold">Active Sessions</CardTitle>
                        <CardDescription>
                          Manage devices with access to your account
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <SessionManagement />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
