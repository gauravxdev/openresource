/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
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
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import { ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Message Actions
// ─────────────────────────────────────────────────────────────────────────────

function MessageActions({
  message,
  isLoading,
  chatId,
  messages,
  setMessages,
  sendMessage,
}: {
  message: ChatMessage;
  isLoading: boolean;
  chatId: string;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
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

  const handleFeedback = async (type: "good" | "bad") => {
    console.log("[Feedback] handleFeedback called with type:", type);
    try {
      console.log("[Feedback] Sending feedback:", {
        messageId: message.id,
        chatId,
        type,
      });

      const response = await fetch("/api/chat/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: message.id,
          chatId,
          type,
        }),
      });

      console.log("[Feedback] Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("[Feedback] Success:", data);
        toast.success("Thanks for the feedback!");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("[Feedback] Error response:", errorData);
        toast.error(
          `Failed to save feedback: ${errorData.error ?? response.statusText}`,
        );
      }
    } catch (error) {
      console.error("[Feedback] Error sending feedback:", error);
      toast.error("Failed to save feedback");
    }
  };

  const handleRegenerate = async () => {
    // Find the last user message before this assistant message
    const messageIndex = messages.findIndex((m) => m.id === message.id);
    if (messageIndex <= 0) {
      toast.error("No user message found to regenerate from");
      return;
    }

    const lastUserMessage = messages[messageIndex - 1];
    if (lastUserMessage?.role !== "user") {
      toast.error("No user message found to regenerate from");
      return;
    }

    try {
      // Delete the assistant message and any trailing messages from DB
      await fetch(`/api/chat/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          messageId: message.id,
        }),
      });

      // Remove messages from UI - keep everything before the user message
      const userMessageIndex = messages.findIndex(
        (m) => m.id === lastUserMessage.id,
      );
      setMessages(messages.slice(0, userMessageIndex + 1));

      // Re-send the last user message to get a new response
      void sendMessage({
        role: "user",
        parts: lastUserMessage.parts,
      });
    } catch (error) {
      console.error("Regenerate error:", error);
      toast.error("Failed to regenerate response");
    }
  };

  if (message.role === "user") return null;

  return (
    <div className="mt-1 flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover/message:opacity-100">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 size-7"
              onClick={handleCopy}
              size="sm"
              type="button"
              variant="ghost"
            >
              <CopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <p>Copy</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 focus-visible:ring-ring inline-flex size-7 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              onClick={() => {
                alert("Thumbs up clicked!");
                console.log("[Feedback] Thumbs up clicked!");
                void handleFeedback("good");
              }}
              type="button"
            >
              <ThumbsUp size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <p>Good response</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 focus-visible:ring-ring inline-flex size-7 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              onClick={() => {
                alert("Thumbs down clicked!");
                console.log("[Feedback] Thumbs down clicked!");
                void handleFeedback("bad");
              }}
              type="button"
            >
              <ThumbsDown size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <p>Bad response</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 size-7"
              onClick={() => void handleRegenerate()}
              size="sm"
              type="button"
              variant="ghost"
            >
              <RotateCcw size={13} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <p>Regenerate</p>
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
  chatId,
  messages,
  setMessages,
  sendMessage,
}: {
  message: ChatMessage;
  isLoading: boolean;
  chatId: string;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
}) => {
  const reasoningParts =
    message.parts?.filter((p) => p.type === "reasoning") || [];
  const reasoningText = reasoningParts.map((p) => (p as any).text).join("\n\n");
  const hasReasoning = reasoningText.trim().length > 0;

  const lastPart = message.parts?.at(-1);
  const isReasoningStreaming = isLoading && lastPart?.type === "reasoning";

  const isToolPart = (p: any) =>
    p.type === "dynamic-tool" ||
    (typeof p.type === "string" && p.type.startsWith("tool-"));

  const isUser = message.role === "user";

  return (
    <div
      className="group/message animate-in fade-in w-full duration-300"
      data-role={message.role}
      data-testid={`message-${message.role}`}
    >
      <div
        className={cn("flex w-full", {
          "justify-end": isUser,
          "justify-start": !isUser,
        })}
      >
        {/* Assistant avatar */}
        {!isUser && (
          <div className="from-primary/80 to-primary text-primary-foreground mt-0.5 mr-3 hidden size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br shadow-sm sm:flex">
            <SparklesIcon size={14} />
          </div>
        )}

        <div
          className={cn("flex min-w-0 flex-col", {
            "max-w-[85%] sm:max-w-[75%]": isUser,
            "max-w-full flex-1": !isUser,
          })}
        >
          {/* Reasoning block */}
          {hasReasoning && (
            <Reasoning isStreaming={isReasoningStreaming}>
              <ReasoningTrigger />
              <ReasoningContent>{reasoningText}</ReasoningContent>
            </Reasoning>
          )}

          {/* User message bubble */}
          {isUser && (
            <div
              className="border-border/40 bg-muted rounded-2xl rounded-br-md border px-4 py-2.5 text-sm leading-relaxed shadow-sm dark:bg-zinc-800"
              data-testid="message-content"
            >
              {message.parts?.map((part, index) => {
                if (part.type !== "text") return null;
                const textContent = (part as any).text;
                if (!textContent?.trim()) return null;
                return (
                  <span key={index} className="text-foreground">
                    {sanitizeText(textContent)}
                  </span>
                );
              })}
            </div>
          )}

          {/* Assistant content */}
          {!isUser && (
            <div className="space-y-3">
              {message.parts?.map((part, index) => {
                const key = `message-${message.id}-part-${index}`;

                if (part.type === "reasoning" || part.type === "step-start") {
                  return null;
                }

                // Text part
                if (part.type === "text") {
                  const textContent = (part as any).text;
                  if (!textContent?.trim()) return null;

                  return (
                    <div
                      key={key}
                      className="text-foreground/90 text-[15px] leading-7"
                    >
                      <Markdown>{sanitizeText(textContent)}</Markdown>
                    </div>
                  );
                }

                // Tool part
                if (isToolPart(part)) {
                  const toolPart = part as any;
                  return (
                    <Tool
                      key={key}
                      defaultOpen={false}
                    >
                      <ToolHeader
                        type={toolPart.type}
                        state={toolPart.state}
                        {...(toolPart.type === "dynamic-tool"
                          ? { toolName: toolPart.toolName }
                          : {})}
                      />
                      <ToolContent>
                        <ToolInput input={toolPart.input} />
                        {toolPart.state === "output-available" ||
                        toolPart.state === "output-error" ? (
                          <ToolOutput
                            output={toolPart.output}
                            errorText={toolPart.errorText}
                          />
                        ) : null}
                      </ToolContent>
                    </Tool>
                  );
                }

                return null;
              })}
            </div>
          )}

          {/* Actions */}
          <MessageActions
            message={message}
            isLoading={isLoading}
            chatId={chatId}
            messages={messages}
            setMessages={setMessages}
            sendMessage={sendMessage}
          />
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
      className="group/message animate-in fade-in w-full duration-300"
      data-role="assistant"
      data-testid="message-assistant-loading"
    >
      <div className="flex items-start justify-start gap-3">
        <div className="from-primary/80 to-primary text-primary-foreground hidden size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br shadow-sm sm:flex">
          <div className="animate-pulse">
            <SparklesIcon size={14} />
          </div>
        </div>

        <div className="flex items-center gap-2 py-1">
          <div className="bg-muted/60 flex items-center gap-1 rounded-full px-3 py-1.5">
            <div className="flex gap-1">
              <span className="bg-muted-foreground/40 size-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
              <span className="bg-muted-foreground/40 size-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
              <span className="bg-muted-foreground/40 size-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
            </div>
            <span className="text-muted-foreground ml-1.5 text-xs">
              Thinking
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
