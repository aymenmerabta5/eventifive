"use client";

import { AppSidebar } from "./_components/app-sidebar";
import { ChartAreaInteractive } from "./_components/ChartAreaInteractive";
import { SectionCards } from "./_components/SectionCards";
import { SiteHeader } from "./_components/site-header";
import { EventFormCard } from "./_components/EventActions";
import { MyEvents } from "./_components/MyEvents";
import { EventRegistration } from "./_components/EventRegistration";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSearchParams } from "next/navigation";
import ShareEvent from "./_components/EventActions/components/ShareEvent";
import { Suspense } from "react";
import Loader from "@/components/loader";

function Dashboard() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const eventId = searchParams.get("eventId");
  const showShareEvent = view === "share-event";
  const showAddEvent = view === "add-event";
  const showUpdateEvent = view === "update-event";
  const showMyEvents = view === "my-events";
  const showEventApprovals = view === "event-approvals";

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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {showAddEvent ? (
                <div className="px-4 lg:px-6">
                  <EventFormCard mode="create" />
                </div>
              ) : showUpdateEvent ? (
                <div className="px-4 lg:px-6">
                  <EventFormCard mode="update" eventId={eventId ?? undefined} />
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
                    <div className="text-destructive text-sm">
                      Missing eventId in URL.
                    </div>
                  )}
                </div>
              ) : showShareEvent ? (
                <div className="px-4 lg:px-6">
                  <ShareEvent eventId={eventId ?? ""} />
                </div>
              ) : (
                <>
                  <SectionCards />
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
    <Suspense
      fallback={
        <div className="relative mt-12 flex items-center justify-center p-4">
          <Loader />
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  );
}
