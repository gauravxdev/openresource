"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { useState } from "react";
import type { ChatMessage } from "@/lib/chat/types";
import { sanitizeText } from "@/lib/chat/utils";
import { cn } from "@/lib/utils";
import { SparklesIcon, CopyIcon } from "./icons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Markdown } from "./markdown";

// ─────────────────────────────────────────────────────────────────────────────
// Message Actions (copy, etc.)
// ─────────────────────────────────────────────────────────────────────────────

function MessageActions({
    message,
    isLoading,
}: {
    message: ChatMessage;
    isLoading: boolean;
}) {
    if (isLoading) return null;

    const textFromParts = message.parts
        ?.filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("\n")
        .trim();

    const handleCopy = async () => {
        if (!textFromParts) {
            toast.error("There's no text to copy!");
            return;
        }
        await navigator.clipboard.writeText(textFromParts);
        toast.success("Copied to clipboard!");
    };

    if (message.role === "user") return null;

    return (
        <div className="flex items-center gap-1 -ml-0.5">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            className="relative size-7 p-1.5 text-muted-foreground hover:text-foreground"
                            onClick={handleCopy}
                            size="sm"
                            type="button"
                            variant="ghost"
                        >
                            <CopyIcon />
                            <span className="sr-only">Copy</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Copy</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Preview Message
// ─────────────────────────────────────────────────────────────────────────────

export const PreviewMessage = ({
    message,
    isLoading,
}: {
    message: ChatMessage;
    isLoading: boolean;
}) => {
    return (
        <div
            className="group/message fade-in w-full animate-in duration-200"
            data-role={message.role}
            data-testid={`message-${message.role}`}
        >
            <div
                className={cn("flex w-full items-start gap-2 md:gap-3", {
                    "justify-end": message.role === "user",
                    "justify-start": message.role === "assistant",
                })}
            >
                {message.role === "assistant" && (
                    <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
                        <SparklesIcon size={14} />
                    </div>
                )}

                <div
                    className={cn("flex flex-col", {
                        "gap-2 md:gap-4": message.parts?.some(
                            (p) => p.type === "text" && p.text?.trim(),
                        ),
                        "w-full": message.role === "assistant",
                        "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
                            message.role === "user",
                    })}
                >
                    {message.parts?.map((part, index) => {
                        const key = `message-${message.id}-part-${index}`;

                        if (part.type === "reasoning") {
                            const hasContent = part.text?.trim().length > 0;
                            if (hasContent) {
                                return (
                                    <div
                                        key={key}
                                        className="text-xs text-muted-foreground italic border-l-2 border-border pl-3 py-1"
                                    >
                                        {part.text}
                                    </div>
                                );
                            }
                        }

                        if (part.type === "text") {
                            return (
                                <div key={key}>
                                    <div
                                        className={cn({
                                            "wrap-break-word w-fit rounded-2xl px-3 py-2 text-right text-white":
                                                message.role === "user",
                                            "bg-transparent px-0 py-0 text-left":
                                                message.role === "assistant",
                                        })}
                                        data-testid="message-content"
                                        style={
                                            message.role === "user"
                                                ? { backgroundColor: "#006cff" }
                                                : undefined
                                        }
                                    >
                                        {message.role === "assistant" ? (
                                            <Markdown>{sanitizeText(part.text)}</Markdown>
                                        ) : (
                                            sanitizeText(part.text)
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        return null;
                    })}

                    <MessageActions message={message} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Thinking Message
// ─────────────────────────────────────────────────────────────────────────────

export const ThinkingMessage = () => {
    return (
        <div
            className="group/message fade-in w-full animate-in duration-300"
            data-role="assistant"
            data-testid="message-assistant-loading"
        >
            <div className="flex items-start justify-start gap-3">
                <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
                    <div className="animate-pulse">
                        <SparklesIcon size={14} />
                    </div>
                </div>

                <div className="flex w-full flex-col gap-2 md:gap-4">
                    <div className="flex items-center gap-1 p-0 text-muted-foreground text-sm">
                        <span className="animate-pulse">Thinking</span>
                        <span className="inline-flex">
                            <span className="animate-bounce [animation-delay:0ms]">.</span>
                            <span className="animate-bounce [animation-delay:150ms]">.</span>
                            <span className="animate-bounce [animation-delay:300ms]">.</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
