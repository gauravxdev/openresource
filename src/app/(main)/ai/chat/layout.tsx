import { cookies, headers } from "next/headers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { auth } from "@/lib/auth";

export default async function AiChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const headersList = await headers();
    const session = await auth.api.getSession({
        headers: headersList,
    });

    const cookieStore = await cookies();
    const isCollapsed = cookieStore.get("sidebar_state")?.value === "false";

    return (
        <SidebarProvider defaultOpen={!isCollapsed}>
            <ChatSidebar userId={session?.user?.id} />
            <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
    );
}
