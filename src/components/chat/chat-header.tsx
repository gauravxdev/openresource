"use client";

import { useRouter } from "next/navigation";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { SparklesIcon } from "./icons";
import { SidebarToggle } from "./sidebar-toggle";

function PureChatHeader({ chatId: _chatId }: { chatId: string }) {
  const router = useRouter();

  return (
    <header className="border-border/50 bg-background/80 sticky top-0 z-20 flex items-center border-b backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-[1152px] items-center gap-2 px-5 py-2 md:px-6">
        <SidebarToggle />

        <div className="flex items-center gap-2">
          <SparklesIcon size={16} />
          <span className="text-sm font-semibold">OpenResource AI</span>
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
  return prevProps.chatId === nextProps.chatId;
});
