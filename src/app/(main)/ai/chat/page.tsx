import { cookies, headers } from "next/headers";
import { Suspense } from "react";
import { Chat } from "@/components/chat/chat";
import { ChatSkeleton } from "@/components/skeletons";
import { DEFAULT_CHAT_MODEL } from "@/lib/chat/models";
import { generateUUID } from "@/lib/chat/utils";
import { auth } from "@/lib/auth";
import { getClientIp, getGuestUsageInfo } from "@/lib/chat/guest-rate-limit";
import { getUserUsageStats } from "@/lib/chat/rate-limit";

export const metadata = {
  title: "AI Chat | OpenResource",
  description: "Chat with OpenResource AI assistant",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string }>;
}) {
  const { prompt } = await searchParams;

  return (
    <Suspense fallback={<ChatSkeleton />}>
      <NewChatPage initialPrompt={prompt} />
    </Suspense>
  );
}

async function NewChatPage({ initialPrompt }: { initialPrompt?: string }) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");
  const id = generateUUID();

  let chatLimitInfo = null;
  let searchLimitInfo = null;

  if (!session?.user) {
    const ipAddress = await getClientIp(headersList);
    if (ipAddress) {
      const usageInfo = await getGuestUsageInfo(ipAddress);
      if (usageInfo) {
        chatLimitInfo = { used: usageInfo.chatCount, limit: 10 };
        searchLimitInfo = { used: usageInfo.searchCount, limit: 1 };
      } else {
        chatLimitInfo = { used: 0, limit: 10 };
        searchLimitInfo = { used: 0, limit: 1 };
      }
    }
  } else {
    const usageStats = await getUserUsageStats(session.user.id);
    chatLimitInfo = { used: usageStats.chatCount, limit: usageStats.chatLimit };
    searchLimitInfo = {
      used: usageStats.searchCount,
      limit: usageStats.searchLimit,
    };
  }

  return (
    <Chat
      id={id}
      initialChatModel={modelIdFromCookie?.value ?? DEFAULT_CHAT_MODEL}
      initialPrompt={initialPrompt}
      isAdmin={session?.user?.role === "admin"}
      isGuest={!session?.user}
      chatLimitInfo={chatLimitInfo}
      searchLimitInfo={searchLimitInfo}
      key={id}
    />
  );
}
