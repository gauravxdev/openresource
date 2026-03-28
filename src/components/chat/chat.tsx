/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-floating-promises, @typescript-eslint/no-unused-vars */
"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import type { UIMessage } from "ai";
import type { ChatMessage } from "@/lib/chat/types";
import { ChatError } from "@/lib/chat/errors";
import { DEFAULT_CHAT_MODEL } from "@/lib/chat/models";
import { generateUUID, fetchWithErrorHandlers } from "@/lib/chat/utils";
import { ChatHeader } from "./chat-header";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { getChatHistoryPaginationKey } from "./sidebar-history";
import { useLocalStorage } from "usehooks-ts";

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialPrompt,
}: {
  id: string;
  initialMessages?: UIMessage[];
  initialChatModel: string;
  initialPrompt?: string;
}) {
  const [input, setInput] = useState<string>("");
  const [currentModelId, setCurrentModelId] = useState(initialChatModel);
  const currentModelIdRef = useRef(currentModelId);

  // Web Search Toggle State
  const [allowSearch, setAllowSearch] = useLocalStorage("allow-search", false, {
    initializeWithValue: false,
  });
  const allowSearchRef = useRef(allowSearch);

  const { mutate } = useSWRConfig();

  useEffect(() => {
    currentModelIdRef.current = currentModelId;
  }, [currentModelId]);

  useEffect(() => {
    allowSearchRef.current = allowSearch;
  }, [allowSearch]);

  const { messages, setMessages, sendMessage, status, stop } = useChat({
    id,
    initialMessages: (initialMessages as ChatMessage[]) ?? [],
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest(request) {
        const lastMessage = request.messages.at(-1);

        return {
          body: {
            id: request.id,
            message: lastMessage,
            selectedChatModel: currentModelIdRef.current,
            allowSearch: allowSearchRef.current,
            ...request.body,
          },
        };
      },
    }),
    onError: (error: any) => {
      if (error instanceof ChatError) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    },
    onFinish: () => {
      // Refresh sidebar history after message completes
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
  } as any) as any;

  // Force-set initial messages from server on mount
  // The useChat hook's internal store may ignore initialMessages if it has stale state
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages as ChatMessage[]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-send initial prompt from URL (e.g., hero search → AI chat)
  const hasSentInitialPrompt = useRef(false);
  useEffect(() => {
    if (
      initialPrompt?.trim() &&
      !hasSentInitialPrompt.current &&
      messages.length === 0
    ) {
      hasSentInitialPrompt.current = true;
      window.history.pushState({}, "", `/ai/chat/${id}`);
      void sendMessage({
        role: "user",
        parts: [{ type: "text", text: initialPrompt.trim() }],
      });
    }
  }, [initialPrompt, id, sendMessage, messages.length]);

  return (
    <div className="bg-background flex h-full min-w-0 flex-col">
      <ChatHeader chatId={id} />

      <Messages
        _chatId={id}
        _isReadonly={false}
        messages={messages}
        _setMessages={setMessages}
        status={status}
        sendMessage={sendMessage}
      />

      <div className="bg-background sticky bottom-0 z-10 mx-auto flex w-full max-w-4xl gap-2 border-t-0 px-2 pb-3 md:px-4 md:pb-4">
        <MultimodalInput
          chatId={id}
          input={input}
          messages={messages}
          onModelChange={setCurrentModelId}
          selectedModelId={currentModelId}
          sendMessage={sendMessage}
          setInput={setInput}
          setMessages={setMessages}
          status={status}
          stop={stop}
          allowSearch={allowSearch}
          setAllowSearch={setAllowSearch}
        />
      </div>
    </div>
  );
}
