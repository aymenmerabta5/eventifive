import Settings from "./_components/Settings";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/dashboard/_components/app-sidebar";

export default function ProfilePage() {
  return (
    <div className="container mx-auto min-h-screen">
      <Settings />
    </div>
  );
}
