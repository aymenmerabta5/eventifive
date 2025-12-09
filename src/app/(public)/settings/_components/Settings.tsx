"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import ProfileInfo from "./ProfileInfo";
import ChangeEmail from "./ChangeEmail";
import ChangePassword from "./ChangePassword";
import { User, Mail, Lock, Settings, ChevronRight, Shield, Bell } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
    description: "Manage your personal info",
    gradient: "from-violet-500 to-purple-600",
    bgGlow: "bg-violet-500/20",
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    description: "Email & notifications",
    gradient: "from-violet-500 to-purple-600",
    bgGlow: "bg-violet-500/20",
  },
  {
    id: "security",
    label: "Security",
    icon: Lock,
    description: "Password & protection",
    gradient: "from-violet-500 to-purple-600",
    bgGlow: "bg-violet-500/20",
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Main() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  // Get current tab data for dynamic styling
  const currentTab = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  // Loading skeleton with matching design
  if (isPending || !user) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background">
        {/* Animated background */}
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          <div className="absolute top-0 left-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] animate-pulse rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-16 space-y-4">
            <Skeleton className="h-12 w-72" />
            <Skeleton className="h-6 w-[450px]" />
          </div>

          <div className="grid gap-30 lg:grid-cols-[320px_1fr]">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
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
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* TEACHING: Multi-layer background creates depth and visual interest
          - Base radial gradient for ambient color
          - Floating orbs with blur for atmosphere
          - Grid pattern for subtle texture */}
      <div className="pointer-events-none fixed inset-0">
        {/* Radial gradient from top */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

        {/* Floating gradient orbs - these create depth */}
        <div
          className={cn(
            "absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full blur-3xl transition-colors duration-1000",
            currentTab.bgGlow
          )}
        />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header with gradient accent */}
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            {/* Animated icon container */}
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-2xl bg-primary/20 blur-xl" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
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
                    <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
                  )}

                  {/* Icon with gradient background */}
                  <div
                    className={cn(
                      "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                      isActive
                        ? `bg-gradient-to-br ${tab.gradient} shadow-lg`
                        : "bg-muted group-hover:scale-105"
                    )}
                  >
                    {/* Glow effect */}
                    {isActive && (
                      <div
                        className={cn(
                          "absolute inset-0 -z-10 rounded-xl blur-xl opacity-50",
                          `bg-gradient-to-br ${tab.gradient}`
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
            <div className="relative mt-6 rounded-2xl border border-dashed border-border/50 p-4">
              <p className="text-xs text-muted-foreground text-center">
                Need help?{" "}
                <span className="text-primary cursor-pointer hover:underline">
                  Contact support
                </span>
              </p>
            </div>
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
                  <div className={cn("h-1 w-full bg-gradient-to-r", currentTab.gradient)} />

                  <CardHeader className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg", currentTab.gradient)}>
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
                  <div className={cn("h-1 w-full bg-gradient-to-r", currentTab.gradient)} />

                  <CardHeader className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg", currentTab.gradient)}>
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
                  <div className={cn("h-1 w-full bg-gradient-to-r", currentTab.gradient)} />

                  <CardHeader className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg", currentTab.gradient)}>
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
          </div>
        </div>
      </div>
    </div>
  );
}
