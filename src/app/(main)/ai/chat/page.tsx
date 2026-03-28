import { cookies } from "next/headers";
import { Suspense } from "react";
import { Chat } from "@/components/chat/chat";
import { ChatSkeleton } from "@/components/skeletons";
import { DEFAULT_CHAT_MODEL } from "@/lib/chat/models";
import { generateUUID } from "@/lib/chat/utils";

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
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");
  const id = generateUUID();

  return (
    <Chat
      id={id}
      initialChatModel={modelIdFromCookie?.value ?? DEFAULT_CHAT_MODEL}
      initialPrompt={initialPrompt}
      key={id}
    />
  );
}
