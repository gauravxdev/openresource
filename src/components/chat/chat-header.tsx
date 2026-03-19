/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { SparklesIcon } from "./icons";
import { SidebarToggle } from "./sidebar-toggle";

function PureChatHeader({ chatId }: { chatId: string }) {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-20 flex items-center border-b border-border/50 bg-background/80 backdrop-blur-sm">
            <div className="mx-auto flex h-full w-full max-w-[1152px] items-center gap-2 px-5 md:px-6 py-2">
                <SidebarToggle />

                <div className="flex items-center gap-2">
                    <SparklesIcon size={16} />
                    <span className="font-semibold text-sm">OpenResource AI</span>
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
