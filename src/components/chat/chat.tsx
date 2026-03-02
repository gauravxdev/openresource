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

export function Chat({
    id,
    initialMessages,
    initialChatModel,
}: {
    id: string;
    initialMessages?: UIMessage[];
    initialChatModel: string;
}) {
    const [input, setInput] = useState<string>("");
    const [currentModelId, setCurrentModelId] = useState(initialChatModel);
    const currentModelIdRef = useRef(currentModelId);
    const { mutate } = useSWRConfig();

    useEffect(() => {
        currentModelIdRef.current = currentModelId;
    }, [currentModelId]);

    const {
        messages,
        setMessages,
        sendMessage,
        status,
        stop,
    } = useChat<ChatMessage>({
        id,
        initialMessages: initialMessages ?? [],
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
                        ...request.body,
                    },
                };
            },
        }),
        onError: (error) => {
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
    });

    // Force-set initial messages from server on mount
    // The useChat hook's internal store may ignore initialMessages if it has stale state
    useEffect(() => {
        if (initialMessages && initialMessages.length > 0) {
            setMessages(initialMessages);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="flex h-full min-w-0 flex-col bg-background">
            <ChatHeader chatId={id} />

            <Messages
                chatId={id}
                isReadonly={false}
                messages={messages}
                setMessages={setMessages}
                status={status}
            />

            <div className="sticky bottom-0 z-10 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
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
                />
            </div>
        </div>
    );
}
