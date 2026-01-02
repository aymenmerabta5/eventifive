"use client";

import * as React from "react";
import Logo from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { navigationData } from "@/lib/navigation-data";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { QuotaIndicator } from "./QuotaIndicator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const navMainItems = [
    ...navigationData.navMain,
    ...(user?.isAdmin ? navigationData.adminNavItems : []),
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
      </SidebarContent>
      <SidebarFooter className="gap-3">
        <QuotaIndicator />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
