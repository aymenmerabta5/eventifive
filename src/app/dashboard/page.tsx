"use client"

import { AppSidebar } from "./_components/app-sidebar"
import { ChartAreaInteractive } from "./_components/chart-area-interactive"
import { DataTable } from "./_components/data-table"
import { SectionCards } from "./_components/section-cards"
import { SiteHeader } from "./_components/site-header"
import { AddEventCard } from "./_components/add-event-card"
import { UpdateEventCard } from "./_components/update-event-card"
import { MyEvents } from "./_components/my-events"
import { EventApprovalsCard } from "./_components/event-approvals-card"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useSearchParams } from "next/navigation"

import data from "./data.json"
import { Suspense } from "react"
import Loader from "@/components/loader"

function Dashboard() {
  const searchParams = useSearchParams()
  const view = searchParams.get("view")
  const showAddEvent = view === "add-event"
  const showUpdateEvent = view === "update-event"
  const showMyEvents = view === "my-events"
  const showEventApprovals = view === "event-approvals"
  const approvalsEventId = searchParams.get("eventId")

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
                  <AddEventCard />
                </div>
              ) : showUpdateEvent ? (
                <div className="px-4 lg:px-6">
                  <UpdateEventCard />
                </div>
              ) : showMyEvents ? (
                <div className="px-4 lg:px-6">
                  <MyEvents />
                </div>
              ) : showEventApprovals ? (
                <div className="px-4 lg:px-6">
                  {approvalsEventId ? (
                    <EventApprovalsCard eventId={approvalsEventId} />
                  ) : (
                    <div className="text-sm text-destructive">
                      Missing eventId in URL.
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <SectionCards />
                  <div className="px-4 lg:px-6">
                    <ChartAreaInteractive />
                  </div>
                  <DataTable data={data} />
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="relative flex mt-12 items-center justify-center p-4">
        <Loader />
      </div>
    }>
      <Dashboard />
    </Suspense>
  )
}
