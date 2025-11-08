"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { navigationData } from "@/lib/navigation-data"

export function SiteHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const getCurrentPageTitle = () => {
    const hasQueryParams = searchParams.toString().length > 0

    // Check navMain items first
    // Prioritize items with query parameters if current URL has query params
    const sortedNavMain = [...navigationData.navMain].sort((a, b) => {
      const aHasQuery = a.url.includes("?")
      const bHasQuery = b.url.includes("?")
      if (hasQueryParams) {
        // If current URL has query params, prioritize items with query params
        return bHasQuery ? 1 : aHasQuery ? -1 : 0
      } else {
        // If current URL has no query params, prioritize items without query params
        return aHasQuery ? 1 : bHasQuery ? -1 : 0
      }
    })

    for (const item of sortedNavMain) {
      if (item.url === "#") continue
      const [path, query] = item.url.split("?")
      if (pathname === path) {
        // If item has no query params, only match if current URL also has no query params
        if (!query) {
          if (!hasQueryParams) return item.title
          continue
        }
        // If item has query params, check if they match
        const params = new URLSearchParams(query)
        let matches = true
        for (const [key, value] of params.entries()) {
          if (searchParams.get(key) !== value) {
            matches = false
            break
          }
        }
        if (matches) return item.title
      }
    }

    // Check documents items
    const sortedDocuments = [...navigationData.documents].sort((a, b) => {
      const aHasQuery = a.url.includes("?")
      const bHasQuery = b.url.includes("?")
      if (hasQueryParams) {
        return bHasQuery ? 1 : aHasQuery ? -1 : 0
      } else {
        return aHasQuery ? 1 : bHasQuery ? -1 : 0
      }
    })

    for (const item of sortedDocuments) {
      if (item.url === "#") continue
      const [path, query] = item.url.split("?")
      if (pathname === path) {
        if (!query) {
          if (!hasQueryParams) return item.name
          continue
        }
        const params = new URLSearchParams(query)
        let matches = true
        for (const [key, value] of params.entries()) {
          if (searchParams.get(key) !== value) {
            matches = false
            break
          }
        }
        if (matches) return item.name
      }
    }

    // Default to "Documents" if no match found
    return "Documents"
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{getCurrentPageTitle()}</h1>
      </div>
    </header>
  )
}
