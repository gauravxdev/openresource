"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="bg-sidebar min-h-[calc(100svh-3.5rem)]">
      <DashboardSidebar />
      <div className="h-[calc(100svh-3.5rem)] w-full overflow-hidden lg:p-2">
        <div className="bg-container bg-background relative flex h-full w-full flex-col items-center justify-start overflow-hidden lg:rounded-md lg:border">
          <main className="w-full flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1152px] px-4 py-4 md:px-6 md:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
