"use client";

import { useRouter } from "next/navigation";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { SparklesIcon } from "./icons";
import { SidebarToggle } from "./sidebar-toggle";

function PureChatHeader({
  chatId: _chatId,
  isGuest,
  chatLimitInfo,
}: {
  chatId: string;
  isGuest?: boolean;
  chatLimitInfo?: { used: number; limit: number } | null;
}) {
  const router = useRouter();
  const remainingChats =
    chatLimitInfo && chatLimitInfo.limit !== Infinity
      ? chatLimitInfo.limit - chatLimitInfo.used
      : null;

  return (
    <header className="border-border/50 bg-background/80 sticky top-0 z-20 flex items-center border-b backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-[1152px] items-center gap-2 px-5 py-2 md:px-6">
        <SidebarToggle />

        <div className="flex items-center gap-2">
          <SparklesIcon size={16} />
          <span className="text-sm font-semibold">OpenResource AI</span>
          {isGuest && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
              Guest
            </span>
          )}
          {chatLimitInfo && remainingChats !== null ? (
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${remainingChats <= 1 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}
            >
              {remainingChats}/{chatLimitInfo.limit} chats left
            </span>
          ) : chatLimitInfo?.limit === Infinity ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
              Unlimited
            </span>
          ) : null}
        </div>

        <Button
          className="ml-auto h-8 px-2"
          onClick={() => {
            router.push("/ai/chat");
            router.refresh();
          }}
          variant="outline"
          size="sm"
        >
          <PlusIcon className="size-4" />
          <span className="ml-1 hidden sm:inline">New Chat</span>
        </Button>
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.isGuest === nextProps.isGuest &&
    prevProps.chatLimitInfo?.used === nextProps.chatLimitInfo?.used
  );
});
