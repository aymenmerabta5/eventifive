"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
// import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
// import Avatar from "./Avatar";
import ProfileInfo from "./ProfileInfo";
import ChangeEmail from "./ChangeEmail";
import ChangePassword from "./ChangePassword";
// import { LogOut, User, Settings, Shield, FileText } from "lucide-react";
import { useState } from "react";
import { Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export default function Main() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [activeTab, setActiveTab] = useState("profile");

  if (isPending || !user) {
    return (
      <div className="flex min-h-screen w-full">
        {/* <aside className="fixed left-0 top-20 z-40 flex h-[calc(100vh-5rem)] w-80 flex-col border-r border-primary/20 bg-card/95 backdrop-blur-md">
          <div className="flex flex-col items-center gap-6 p-8 pt-24">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="text-center w-full space-y-2">
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
            <div className="w-full h-px bg-primary/10 mt-4"></div>
            <div className="w-full flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="flex-1 px-4 py-6 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="p-6 border-t border-primary/20">
            <Skeleton className="h-11 w-full" />
          </div>
        </aside> */}

        <main className="ml-80 flex-1 p-8">
          <div className="relative max-w-4xl">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20"></div>
            
            <div className="space-y-6">
              <Card className="border-primary/20 bg-card/90 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full mt-6" />
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/90 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full mt-6" />
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/90 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full mt-4" />
                  <Skeleton className="h-10 w-full mt-6" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }
  

  return (
    <div className="flex min-h-screen w-full">
      {/* <aside className="fixed left-0 top-20 z-40 flex h-[calc(100vh-5rem)] w-80 flex-col border-r border-primary/20 bg-gradient-to-b from-card/95 to-card/90 backdrop-blur-md shadow-2xl">
        <div className="absolute inset-0 bg-primary/5 opacity-50"></div>
        <div className="relative flex flex-col items-center gap-6 p-8 pt-24">
          <Avatar user={user} isPending={isPending} />
          <div className="w-full h-px bg-linear-to-r from-transparent via-primary/30 to-transparent mt-2"></div>
        </div>
        
        <nav className="relative flex-1 px-4 py-6 space-y-2">
          <Button
            onClick={() => setActiveTab("profile")}
            variant={activeTab === "profile" ? "default" : "ghost"}
            className={`w-full justify-start gap-3 h-11 ${
              activeTab === "profile"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "hover:bg-primary/10"
            }`}
          >
            <User className="h-4 w-4" />
            Edit Profile
          </Button>
          
          <Button
            onClick={() => setActiveTab("preferences")}
            variant={activeTab === "preferences" ? "default" : "ghost"}
            className={`w-full justify-start gap-3 h-11 ${
              activeTab === "preferences"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "hover:bg-primary/10"
            }`}
          >
            <Settings className="h-4 w-4" />
            Preferences
          </Button>
          
          <Button
            onClick={() => setActiveTab("security")}
            variant={activeTab === "security" ? "default" : "ghost"}
            className={`w-full justify-start gap-3 h-11 ${
              activeTab === "security"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "hover:bg-primary/10"
            }`}
          >
            <Shield className="h-4 w-4" />
            Security
          </Button>
          
          <Button
            onClick={() => setActiveTab("privacy")}
            variant={activeTab === "privacy" ? "default" : "ghost"}
            className={`w-full justify-start gap-3 h-11 ${
              activeTab === "privacy"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "hover:bg-primary/10"
            }`}
          >
            <FileText className="h-4 w-4" />
            Data Privacy
          </Button>
        </nav>
        
        <div className="relative p-6 border-t border-primary/20">
          <Button
            onClick={async () => {
              await authClient.signOut();
            }}
            variant="destructive"
            className="w-full h-11 gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside> */}

      <main className="ml-80 flex-1 p-8 pt-16">
        <div className="relative max-w-4xl">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20"></div>

          <div className="relative space-y-6">
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Account Settings
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Manage your profile and security preferences
              </p>
            </div>

            <Card className="border-primary/20 bg-card/95 backdrop-blur-sm shadow-xl hover:border-primary/30 hover:shadow-2xl transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-1 bg-linear-to-r from-primary to-primary/60 rounded-full group-hover:w-1.5 transition-all"></div>
                  <CardTitle className="text-xl">Profile Information</CardTitle>
                </div>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileInfo user={user} />
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/95 backdrop-blur-sm shadow-xl hover:border-primary/30 hover:shadow-2xl transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-1 bg-linear-to-r from-primary to-primary/60 rounded-full group-hover:w-1.5 transition-all"></div>
                  <CardTitle className="text-xl">Email Address</CardTitle>
                </div>
                <CardDescription>Manage your email preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <ChangeEmail user={user} />
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/95 backdrop-blur-sm shadow-xl hover:border-primary/30 hover:shadow-2xl transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-1 bg-linear-to-r from-primary to-primary/60 rounded-full group-hover:w-1.5 transition-all"></div>
                  <CardTitle className="text-xl">Security</CardTitle>
                </div>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePassword />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
