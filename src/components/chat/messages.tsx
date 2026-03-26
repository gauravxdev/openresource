/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { ArrowDownIcon } from "lucide-react";
import { useMessages } from "@/hooks/use-chat-messages";
import type { ChatMessage } from "@/lib/chat/types";
import { Greeting } from "./greeting";
import { PreviewMessage, ThinkingMessage } from "./message";

type MessagesProps = {
  _chatId: string;
  status: UseChatHelpers<ChatMessage>["status"];
  messages: ChatMessage[];
  _setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  _isReadonly: boolean;
};

function PureMessages({
  _chatId: _chatId,
  status,
  messages,
  _setMessages: _setMessages,
  _isReadonly: _isReadonly,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    scrollToBottom,
    hasSentMessage: _hasSentMessage,
  } = useMessages({
    status,
  });

  return (
    <div className="bg-background relative flex-1">
      <div
        className="bg-background absolute inset-0 touch-pan-y overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={messagesContainerRef}
      >
        <div className="mx-auto flex max-w-4xl min-w-0 flex-col gap-6 px-4 py-6 md:gap-8 md:px-6">
          {messages.length === 0 && <Greeting />}

          {messages.map((message, index) => (
            <PreviewMessage
              isLoading={
                status === "streaming" && messages.length - 1 === index
              }
              key={message.id}
              message={message}
              chatId={_chatId}
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
        className={`border-border/50 bg-background/80 hover:bg-muted absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border p-2.5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
          isAtBottom
            ? "pointer-events-none scale-90 opacity-0"
            : "pointer-events-auto scale-100 opacity-100"
        }`}
        onClick={() => scrollToBottom("smooth")}
        type="button"
      >
        <ArrowDownIcon className="text-muted-foreground size-4" />
      </button>
    </div>
  );
}

export const Messages = PureMessages;
