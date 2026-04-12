import { cookies, headers } from "next/headers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { auth } from "@/lib/auth";
import { getClientIp } from "@/lib/chat/guest-rate-limit";

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

  let userId: string | undefined = session?.user?.id;

  if (!userId) {
    const ipAddress = await getClientIp(headersList);
    if (ipAddress) {
      userId = `guest_${ipAddress}`;
    }
  }

  return (
    <SidebarProvider
      defaultOpen={!isCollapsed}
      className="h-[calc(100dvh-57px)] min-h-0"
    >
      <ChatSidebar userId={userId} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
