"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/chat/types";
import { ChatError } from "@/lib/chat/errors";
import { DEFAULT_CHAT_MODEL } from "@/lib/chat/models";
import { generateUUID, fetchWithErrorHandlers } from "@/lib/chat/utils";
import { ChatHeader } from "./chat-header";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { toast } from "sonner";

export function Chat({
    id,
    initialChatModel,
}: {
    id: string;
    initialChatModel: string;
}) {
    const [input, setInput] = useState<string>("");
    const [currentModelId, setCurrentModelId] = useState(initialChatModel);
    const currentModelIdRef = useRef(currentModelId);

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
        messages: [],
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
    });

    return (
        <div className="flex h-dvh min-w-0 flex-col bg-background">
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
