"use client";

import { AppSidebar } from "./_components/app-sidebar";
import { ChartAreaInteractive } from "./_components/ChartAreaInteractive";
import { SectionCards } from "./_components/SectionCards";
import { AdminSectionCards } from "./_components/AdminSectionCards";
import { SiteHeader } from "./_components/site-header";
import { EventFormCard } from "./_components/EventActions";
import { MyEvents } from "./_components/MyEvents";
import { EventRegistration } from "./_components/EventRegistration";
import AdminEventManagement from "./_components/AdminEventManagement/AdminEventManagement";
import { Users } from "./_components/AdminUsersManagement";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSearchParams, useRouter } from "next/navigation";
import ShareEvent from "./_components/EventActions/components/ShareEvent";
import { Suspense, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { WelcomeSection } from "./_components/WelcomeSection";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Welcome skeleton */}
      <div className="px-4 lg:px-6">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl",
            "bg-card border-border/40 border",
          )}
        >
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-8 w-48 sm:w-64" />
              </div>
              <Skeleton className="h-4 w-64 sm:w-80" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-36 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "relative overflow-hidden rounded-2xl",
              "bg-card border-border/40 border",
              "animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-backwards duration-500",
            )}
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <div className="absolute top-0 left-0 h-full w-1 rounded-l-2xl">
              <Skeleton className="h-full w-full rounded-l-2xl" />
            </div>
            <div className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-9 w-32" />
              <div className="border-border/40 flex items-center gap-3 border-t pt-4">
                <Skeleton className="size-8 rounded-xl" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2.5 w-40" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="px-4 lg:px-6">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl",
            "bg-card border-border/40 border",
            "animate-in fade-in-0 slide-in-from-bottom-3 duration-500",
          )}
          style={{ animationDelay: "300ms" }}
        >
          <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </div>
          <div className="px-6 pb-6">
            <Skeleton className="h-[250px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const view = searchParams.get("view");
  const eventId = searchParams.get("eventId");
  const showShareEvent = view === "share-event";
  const showAddEvent = view === "add-event";
  const showUpdateEvent = view === "update-event";
  const showMyEvents = view === "my-events";
  const showEventApprovals = view === "event-approvals";
  const showEventManagement = view === "event-management";
  const showUsers = view === "users";

  const isAdmin = session?.user?.isAdmin ?? false;
  const isAdminOnlyView = showEventManagement || showUsers;

  // Redirect non-admins away from admin-only views
  useEffect(() => {
    if (!isPending && !isAdmin && isAdminOnlyView) {
      router.replace("/dashboard");
    }
  }, [isPending, isAdmin, isAdminOnlyView, router]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6 py-6">
              {showAddEvent ? (
                <div className="px-4 lg:px-6">
                  <EventFormCard key="create" mode="create" />
                </div>
              ) : showUpdateEvent ? (
                <div className="px-4 lg:px-6">
                  <EventFormCard
                    key={`update-${eventId}`}
                    mode="update"
                    eventId={eventId ?? undefined}
                  />
                </div>
              ) : showMyEvents ? (
                <div className="px-4 lg:px-6">
                  <MyEvents />
                </div>
              ) : showEventApprovals ? (
                <div className="px-4 lg:px-6">
                  {eventId ? (
                    <EventRegistration eventId={eventId} />
                  ) : (
                    <div className="border-destructive/20 bg-destructive/5 flex items-center justify-center rounded-2xl border py-8">
                      <p className="text-destructive text-sm">
                        Missing eventId in URL.
                      </p>
                    </div>
                  )}
                </div>
              ) : showShareEvent ? (
                <div className="px-4 lg:px-6">
                  <ShareEvent eventId={eventId ?? ""} />
                </div>
              ) : showEventManagement ? (
                <div className="px-4 lg:px-6">
                  {isAdmin ? <AdminEventManagement /> : <DashboardSkeleton />}
                </div>
              ) : showUsers ? (
                <div className="px-4 lg:px-6">
                  {isAdmin ? <Users /> : <DashboardSkeleton />}
                </div>
              ) : (
                <>
                  {/* Welcome Section */}
                  <WelcomeSection />

                  {/* Stats Cards */}
                  {isAdmin ? <AdminSectionCards /> : <SectionCards />}

                  {/* Activity Chart */}
                  <div className="px-4 lg:px-6">
                    <ChartAreaInteractive />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <Dashboard />
    </Suspense>
  );
}

function DashboardPageFallback() {
  return (
    <div className="bg-background flex min-h-screen">
      {/* Sidebar skeleton */}
      <div className="border-border/40 bg-sidebar hidden w-72 flex-shrink-0 border-r lg:block">
        <div className="border-border/40 flex h-14 items-center gap-3 border-b px-6">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex flex-col gap-2 p-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              className="h-10 w-full rounded-lg"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1">
        {/* Header skeleton */}
        <div className="border-border/40 flex h-12 items-center gap-3 border-b px-4 lg:px-6">
          <Skeleton className="size-8 rounded-lg lg:hidden" />
          <Skeleton className="h-5 w-32" />
        </div>

        {/* Dashboard content skeleton */}
        <div className="@container/main">
          <DashboardSkeleton />
        </div>
      </div>
    </div>
  );
}
