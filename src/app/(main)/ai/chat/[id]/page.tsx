import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { Chat } from "@/components/chat/chat";
import { DEFAULT_CHAT_MODEL } from "@/lib/chat/models";
import { getChatById, getMessagesByChatId } from "@/lib/chat/queries";
import { auth } from "@/lib/auth";
import { getClientIp } from "@/lib/chat/guest-rate-limit";
import type { UIMessage } from "ai";

export const metadata = {
  title: "AI Chat | OpenResource",
  description: "Chat with OpenResource AI assistant",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  let isGuest = false;
  let isAuthorized = false;

  if (session?.user) {
    isAuthorized = chat.userId === session.user.id;
  } else {
    const ipAddress = await getClientIp(headersList);
    if (ipAddress) {
      const guestUserId = `guest_${ipAddress}`;
      isAuthorized = chat.userId === guestUserId;
      isGuest = isAuthorized;
    }
  }

  if (!isAuthorized) {
    notFound();
  }

  const dbMessages = await getMessagesByChatId({ id });
  console.log(`[Chat ${id}] Loaded ${dbMessages.length} messages from DB`);
  if (dbMessages.length > 0) {
    console.log(
      `[Chat ${id}] First message role: ${dbMessages[0]!.role}, parts:`,
      JSON.stringify(dbMessages[0]!.parts).substring(0, 200),
    );
  }

  const initialMessages: UIMessage[] = dbMessages.map((msg) => {
    const partsArray = msg.parts as Array<{
      type: string;
      text?: string;
    }> | null;
    const content = partsArray
      ? partsArray
          .filter((p) => p.type === "text")
          .map((p) => p.text)
          .join("")
      : "";

    return {
      id: msg.id,
      role: msg.role as UIMessage["role"],
      content,
      parts: msg.parts as UIMessage["parts"],
      createdAt: msg.createdAt,
    };
  });
  console.log(
    `[Chat ${id}] Converted ${initialMessages.length} initialMessages`,
  );

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");

  return (
    <Chat
      id={id}
      initialMessages={initialMessages}
      initialChatModel={modelIdFromCookie?.value ?? DEFAULT_CHAT_MODEL}
      isAdmin={session?.user?.role === "admin"}
      isGuest={isGuest}
      key={id}
    />
  );
}
