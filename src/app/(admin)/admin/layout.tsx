/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { DashboardSidebar } from "@/components/admin/sidebar";
import { DashboardHeader } from "@/components/admin/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/hooks/use-session";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <SidebarProvider className="bg-sidebar">
      <DashboardSidebar />
      <div className="h-svh w-full overflow-hidden lg:p-2">
        <div className="bg-container bg-background relative flex h-full w-full flex-col items-center justify-start overflow-hidden lg:rounded-md lg:border">
          <DashboardHeader />
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
