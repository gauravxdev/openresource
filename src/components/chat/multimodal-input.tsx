/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { GlobeIcon, CheckIcon } from "lucide-react";
import equal from "fast-deep-equal";
import {
  type Dispatch,
  memo,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { toast } from "sonner";
import {
  chatModels,
  DEFAULT_CHAT_MODEL,
  modelsByProvider,
} from "@/lib/chat/models";
import type { ChatMessage } from "@/lib/chat/types";
import { cn } from "@/lib/utils";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "./prompt-input";
import { ArrowUpIcon, StopIcon } from "./icons";
import { SuggestedActions } from "./suggested-actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function setCookie(name: string, value: string) {
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
}

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  messages,
  setMessages,
  sendMessage,
  className,
  selectedModelId,
  onModelChange,
  allowSearch,
  setAllowSearch,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>["status"];
  stop: () => void;
  messages: UIMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  className?: string;
  selectedModelId: string;
  onModelChange?: (modelId: string) => void;
  allowSearch: boolean;
  setAllowSearch: (value: boolean) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [adjustHeight]);

  const hasAutoFocused = useRef(false);
  useEffect(() => {
    if (!hasAutoFocused.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
        hasAutoFocused.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const resetHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const submitForm = useCallback(() => {
    if (status !== "ready") {
      toast.error("Please wait for the model to finish its response!");
      return;
    }

    if (!input.trim()) return;

    window.history.pushState({}, "", `/ai/chat/${chatId}`);

    void sendMessage({
      role: "user",
      parts: [
        {
          type: "text",
          text: input,
        },
      ],
    });

    resetHeight();
    setInput("");

    textareaRef.current?.focus();
  }, [input, setInput, sendMessage, chatId, resetHeight, status]);

  return (
    <div className={cn("relative flex w-full flex-col gap-4", className)}>
      {messages.length === 0 && (
        <SuggestedActions chatId={chatId} sendMessage={sendMessage} />
      )}

      <PromptInput
        className="border-border bg-background focus-within:border-border hover:border-muted-foreground/50 rounded-xl border p-3 shadow-xs transition-all duration-200"
        onSubmit={(event) => {
          event.preventDefault();
          if (!input.trim()) {
            return;
          }
          if (status !== "ready") {
            toast.error("Please wait for the model to finish its response!");
          } else {
            submitForm();
          }
        }}
      >
        <div className="flex flex-row items-start gap-1 sm:gap-2">
          <PromptInputTextarea
            className="placeholder:text-muted-foreground grow resize-none border-0! border-none! bg-transparent p-2 text-base ring-0 outline-none [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none [&::-webkit-scrollbar]:hidden"
            data-testid="multimodal-input"
            disableAutoResize={true}
            onChange={handleInput}
            placeholder="Send a message..."
            ref={textareaRef}
            rows={1}
            value={input}
          />
        </div>
        <PromptInputToolbar className="border-top-0! border-t-0! p-0 shadow-none dark:border-0 dark:border-transparent!">
          <PromptInputTools className="gap-0 sm:gap-0.5">
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setAllowSearch(!allowSearch)}
                    className={cn(
                      "h-8 w-8 rounded-full transition-colors",
                      allowSearch
                        ? "bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5",
                    )}
                  >
                    <GlobeIcon className="h-4 w-4" />
                    <span className="sr-only">Toggle web search</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Web Search {allowSearch ? "Enabled" : "Disabled"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <ModelSelectorCompact
              onModelChange={onModelChange}
              selectedModelId={selectedModelId}
            />
          </PromptInputTools>

          {status === "submitted" ? (
            <StopButton setMessages={setMessages} stop={stop} />
          ) : (
            <PromptInputSubmit
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground size-8 rounded-full transition-colors duration-200"
              data-testid="send-button"
              disabled={!input.trim()}
              status={status}
            >
              <ArrowUpIcon size={14} />
            </PromptInputSubmit>
          )}
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) {
      return false;
    }
    if (prevProps.status !== nextProps.status) {
      return false;
    }
    if (prevProps.selectedModelId !== nextProps.selectedModelId) {
      return false;
    }
    if (prevProps.allowSearch !== nextProps.allowSearch) {
      return false;
    }
    if (!equal(prevProps.messages, nextProps.messages)) {
      return false;
    }
    return true;
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Model Selector
// ─────────────────────────────────────────────────────────────────────────────

function PureModelSelectorCompact({
  selectedModelId,
  onModelChange,
}: {
  selectedModelId: string;
  onModelChange?: (modelId: string) => void;
}) {
  const selectedModel =
    chatModels.find((m) => m.id === selectedModelId) ??
    chatModels.find((m) => m.id === DEFAULT_CHAT_MODEL) ??
    chatModels[0];

  if (!selectedModel) return null;

  return (
    <Select
      value={selectedModel.id}
      onValueChange={(value) => {
        onModelChange?.(value);
        setCookie("chat-model", value);
      }}
    >
      <SelectTrigger className="h-8 w-[180px] border-none bg-transparent px-2 text-xs shadow-none focus:ring-0">
        <SelectValue placeholder="Select model" />
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(modelsByProvider) as [string, any[]][]).map(
          ([providerKey, providerModels]) => (
            <SelectGroup key={providerKey}>
              <SelectLabel className="text-xs font-semibold capitalize">
                {providerKey}
              </SelectLabel>
              {providerModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <span>{model.name}</span>
                    {model.id === selectedModel.id && (
                      <CheckIcon className="ml-auto size-3" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ),
        )}
      </SelectContent>
    </Select>
  );
}

const ModelSelectorCompact = memo(PureModelSelectorCompact);

// ─────────────────────────────────────────────────────────────────────────────
// Stop Button
// ─────────────────────────────────────────────────────────────────────────────

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
}) {
  return (
    <Button
      className="bg-foreground text-background hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground size-7 rounded-full p-1 transition-colors duration-200"
      data-testid="stop-button"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);
