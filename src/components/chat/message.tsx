"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
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
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { Reasoning, ReasoningTrigger, ReasoningContent } from "@/components/ai-elements/reasoning";

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
    // Consolidate all reasoning parts into a single block
    const reasoningParts = message.parts?.filter((p) => p.type === "reasoning") || [];
    const reasoningText = reasoningParts.map((p) => (p as any).text).join("\n\n");
    const hasReasoning = reasoningText.trim().length > 0;

    // Check if reasoning is still streaming (last part is reasoning on this message)
    const lastPart = message.parts?.at(-1);
    const isReasoningStreaming = isLoading && lastPart?.type === "reasoning";

    // Helper: check if a part is a tool invocation (static or dynamic)
    const isToolPart = (p: any) =>
        p.type === "dynamic-tool" || (typeof p.type === "string" && p.type.startsWith("tool-"));

    // Check if there are any tool or text parts for gap styling
    const hasContent = message.parts?.some(
        (p) => (p.type === "text" && (p as any).text?.trim()) || isToolPart(p),
    );

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
                        "gap-2 md:gap-4": hasContent || hasReasoning,
                        "w-full": message.role === "assistant",
                        "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
                            message.role === "user",
                    })}
                >
                    {/* Consolidated reasoning block (rendered before text) */}
                    {hasReasoning && (
                        <Reasoning isStreaming={isReasoningStreaming}>
                            <ReasoningTrigger />
                            <ReasoningContent>
                                {reasoningText}
                            </ReasoningContent>
                        </Reasoning>
                    )}

                    {/* Render text and tool parts */}
                    {message.parts?.map((part, index) => {
                        const key = `message-${message.id}-part-${index}`;

                        // Skip reasoning — already consolidated above
                        if (part.type === "reasoning") {
                            return null;
                        }

                        // Skip step-start boundaries
                        if (part.type === "step-start") {
                            return null;
                        }

                        // Text part
                        if (part.type === "text") {
                            const textContent = (part as any).text;
                            if (!textContent?.trim()) return null;

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
                                            <Markdown>{sanitizeText(textContent)}</Markdown>
                                        ) : (
                                            sanitizeText(textContent)
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        // Tool part: handles both static (tool-{name}) and dynamic (dynamic-tool)
                        if (isToolPart(part)) {
                            const toolPart = part as any;

                            return (
                                <Tool key={key} defaultOpen={toolPart.state !== "output-available"}>
                                    <ToolHeader
                                        type={toolPart.type}
                                        state={toolPart.state}
                                        {...(toolPart.type === "dynamic-tool" ? { toolName: toolPart.toolName } : {})}
                                    />
                                    <ToolContent>
                                        <ToolInput input={toolPart.input} />
                                        {(toolPart.state === "output-available" || toolPart.state === "output-error") ? (
                                            <ToolOutput output={toolPart.output} errorText={toolPart.errorText} />
                                        ) : null}
                                    </ToolContent>
                                </Tool>
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
