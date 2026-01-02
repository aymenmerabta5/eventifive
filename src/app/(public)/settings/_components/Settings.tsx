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
import { ProfileInfo } from "./ProfileInfo";
import ChangePassword from "./ChangePassword";
import { SessionManagement } from "./SessionManagement";
import { SubscriptionSettings } from "./SubscriptionSettings";
import {
  User,
  Lock,
  Settings,
  ChevronRight,
  Smartphone,
  Crown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Route } from "next";

const tabs = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
    description: "Manage your personal info",
  },
  {
    id: "subscription",
    label: "Subscription",
    icon: Crown,
    description: "Plan & billing",
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
  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user;
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const validTabs = tabs.map((t) => t.id);
  const initialTab =
    tabParam && validTabs.includes(tabParam as TabId)
      ? (tabParam as TabId)
      : "profile";
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam as TabId)) {
      setActiveTab(tabParam as TabId);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    if (tabId === "profile") {
      params.delete("tab");
    } else {
      params.set("tab", tabId);
    }
    const newUrl = (
      params.toString() ? `/settings?${params.toString()}` : "/settings"
    ) as Route;
    router.replace(newUrl, { scroll: false });
  };

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
        <div className="mb-4 flex items-center gap-4">
          {/* Animated icon container */}
          <div className="relative">
            <div className="bg-primary/20 absolute inset-0 animate-pulse rounded-2xl blur-xl" />
            <div className="from-primary to-primary/80 shadow-primary/25 relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg">
              <Settings className="text-primary-foreground h-7 w-7" />
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
                onClick={() => handleTabChange(tab.id)}
                style={{ animationDelay: `${index * 50}ms` }}
                className={cn(
                  "group relative flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all duration-300",
                  "animate-in fade-in slide-in-from-left-2",
                  isActive
                    ? "bg-card ring-border/50 shadow-xl ring-1 shadow-black/10"
                    : "hover:bg-card/50 hover:shadow-lg hover:shadow-black/5",
                )}
              >
                {/* Gradient border effect for active state */}
                {isActive && (
                  <div className="from-primary/20 via-primary/10 absolute inset-0 -z-10 rounded-2xl bg-linear-to-r to-transparent" />
                )}

                {/* Icon with gradient background */}
                <div
                  className={cn(
                    "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                    isActive
                      ? `bg-linear-to-br from-violet-500 to-purple-600 shadow-lg`
                      : "bg-muted group-hover:scale-105",
                  )}
                >
                  {/* Glow effect */}
                  {isActive && (
                    <div
                      className={cn(
                        "absolute inset-0 -z-10 rounded-xl opacity-50 blur-xl",
                        `bg-linear-to-br from-violet-500 to-purple-600`,
                      )}
                    />
                  )}
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                </div>

                {/* Text content */}
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "font-semibold transition-colors",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </div>
                  <div className="text-muted-foreground mt-0.5 truncate text-xs">
                    {tab.description}
                  </div>
                </div>

                {/* Arrow indicator */}
                <ChevronRight
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive
                      ? "text-primary translate-x-0 opacity-100"
                      : "text-muted-foreground -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50",
                  )}
                />
              </button>
            );
          })}

          {/* Decorative element below nav */}
          <Card className="border-border/50 mt-6 border-dashed">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-xs">
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
          {/* Subscription Tab */}
          <div
            className={cn(
              "transition-all duration-300",
              activeTab === "subscription"
                ? "animate-in fade-in slide-in-from-right-4"
                : "hidden",
            )}
          >
            {activeTab === "subscription" && (
              <Card className="bg-card/80 overflow-hidden rounded-3xl border-0 shadow-2xl shadow-black/10 backdrop-blur-xl">
                <div
                  className={cn(
                    "h-1 w-full bg-linear-to-r from-violet-500 to-purple-600",
                  )}
                />

                <CardHeader className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-purple-600 shadow-lg",
                      )}
                    >
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold">
                        Subscription
                      </CardTitle>
                      <CardDescription>
                        Manage your plan and billing
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <SubscriptionSettings />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Profile Tab */}
          <div
            className={cn(
              "transition-all duration-300",
              activeTab === "profile"
                ? "animate-in fade-in slide-in-from-right-4"
                : "hidden",
            )}
          >
            {activeTab === "profile" && (
              <Card className="bg-card/80 overflow-hidden rounded-3xl border-0 shadow-2xl shadow-black/10 backdrop-blur-xl">
                {/* Gradient top border */}
                <div
                  className={cn(
                    "h-1 w-full bg-linear-to-r from-violet-500 to-purple-600",
                  )}
                />

                <CardHeader className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-purple-600 shadow-lg",
                      )}
                    >
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold">
                        Profile Information
                      </CardTitle>
                      <CardDescription>
                        Update your photo and personal details
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <ProfileInfo user={user} onSessionRefresh={refetch} />
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
                : "hidden",
            )}
          >
            {activeTab === "security" && (
              <Card className="bg-card/80 overflow-hidden rounded-3xl border-0 shadow-2xl shadow-black/10 backdrop-blur-xl">
                <div
                  className={cn(
                    "h-1 w-full bg-linear-to-r from-violet-500 to-purple-600",
                  )}
                />

                <CardHeader className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-purple-600 shadow-lg",
                      )}
                    >
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold">
                        Security Settings
                      </CardTitle>
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
                : "hidden",
            )}
          >
            {activeTab === "sessions" && (
              <Card className="bg-card/80 overflow-hidden rounded-3xl border-0 shadow-2xl shadow-black/10 backdrop-blur-xl">
                <div
                  className={cn(
                    "h-1 w-full bg-linear-to-r from-violet-500 to-purple-600",
                  )}
                />

                <CardHeader className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-purple-600 shadow-lg",
                      )}
                    >
                      <Smartphone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold">
                        Active Sessions
                      </CardTitle>
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
