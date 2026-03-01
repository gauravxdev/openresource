"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { ArrowDownIcon } from "lucide-react";
import { useMessages } from "@/hooks/use-chat-messages";
import type { ChatMessage } from "@/lib/chat/types";
import { Greeting } from "./greeting";
import { PreviewMessage, ThinkingMessage } from "./message";

type MessagesProps = {
    chatId: string;
    status: UseChatHelpers<ChatMessage>["status"];
    messages: ChatMessage[];
    setMessages: UseChatHelpers<ChatMessage>["setMessages"];
    isReadonly: boolean;
};

function PureMessages({
    chatId,
    status,
    messages,
    setMessages,
    isReadonly,
}: MessagesProps) {
    const {
        containerRef: messagesContainerRef,
        endRef: messagesEndRef,
        isAtBottom,
        scrollToBottom,
        hasSentMessage,
    } = useMessages({
        status,
    });

    return (
        <div className="relative flex-1 bg-background">
            <div
                className="absolute inset-0 touch-pan-y overflow-y-auto bg-background"
                ref={messagesContainerRef}
            >
                <div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
                    {messages.length === 0 && <Greeting />}

                    {messages.map((message, index) => (
                        <PreviewMessage
                            isLoading={
                                status === "streaming" && messages.length - 1 === index
                            }
                            key={message.id}
                            message={message}
                        />
                    ))}

                    {status === "submitted" && <ThinkingMessage />}

                    <div
                        className="min-h-[24px] min-w-[24px] shrink-0"
                        ref={messagesEndRef}
                    />
                </div>
            </div>

            <button
                aria-label="Scroll to bottom"
                className={`absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border bg-background p-2 shadow-lg transition-all hover:bg-muted ${isAtBottom
                        ? "pointer-events-none scale-0 opacity-0"
                        : "pointer-events-auto scale-100 opacity-100"
                    }`}
                onClick={() => scrollToBottom("smooth")}
                type="button"
            >
                <ArrowDownIcon className="size-4" />
            </button>
        </div>
    );
}

export const Messages = PureMessages;
