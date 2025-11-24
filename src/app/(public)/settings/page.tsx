import Settings from "./_components/Settings";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/dashboard/_components/app-sidebar";

export default function ProfilePage() {
  return (
    <div className="container mx-auto min-h-screen">
      {/* Removing sidebar for now to be fixed later when i have time */}
      {/* <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" /> */}
          <Settings />
      {/* </SidebarProvider> */}
    </div>
  );
}
