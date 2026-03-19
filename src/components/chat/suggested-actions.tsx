"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { memo } from "react";
import type { ChatMessage } from "@/lib/chat/types";
import { Button } from "@/components/ui/button";

type SuggestedActionsProps = {
    chatId: string;
    sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
};

function PureSuggestedActions({ chatId, sendMessage }: SuggestedActionsProps) {
    const suggestedActions = [
        "What are the best open-source alternatives to popular tools?",
        "How do I evaluate an open-source project for production use?",
        "Help me write a README for my open-source project",
        "What open-source tools can help improve developer productivity?",
    ];

    return (
        <div
            className="grid w-full gap-2 sm:grid-cols-2"
            data-testid="suggested-actions"
        >
            {suggestedActions.map((suggestedAction, index) => (
                <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    initial={{ opacity: 0, y: 20 }}
                    key={suggestedAction}
                    transition={{ delay: 0.05 * index }}
                >
                    <Button
                        className="h-auto w-full cursor-pointer whitespace-normal rounded-xl border border-border/50 bg-background p-3 text-left text-sm text-muted-foreground shadow-xs transition-colors hover:bg-muted hover:text-foreground"
                        onClick={() => {
                            window.history.pushState({}, "", `/ai/chat/${chatId}`);
                            void sendMessage({
                                role: "user",
                                parts: [{ type: "text", text: suggestedAction }],
                            });
                        }}
                        variant="ghost"
                    >
                        {suggestedAction}
                    </Button>
                </motion.div>
            ))}
        </div>
    );
}

export const SuggestedActions = memo(
    PureSuggestedActions,
    (prevProps, nextProps) => {
        if (prevProps.chatId !== nextProps.chatId) {
            return false;
        }
        return true;
    },
);
