import { DashboardSidebar } from "@/components/admin/sidebar";
import { DashboardHeader } from "@/components/admin/header";
import { DashboardContent } from "@/components/admin/content";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AdminPage() {
    return (
        <SidebarProvider className="bg-sidebar">
            <DashboardSidebar />
            <div className="h-svh overflow-hidden lg:p-2 w-full">
                <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container h-full w-full bg-background relative">
                    <DashboardHeader />
                    <DashboardContent />
                </div>
            </div>
        </SidebarProvider>
    );
}
