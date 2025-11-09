"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { AddEventCard } from "@/components/add-event-card"
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
