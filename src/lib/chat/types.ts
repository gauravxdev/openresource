import type { UIMessage, UIMessagePart } from "ai";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Message metadata
// ─────────────────────────────────────────────────────────────────────────────

export const messageMetadataSchema = z.object({
    createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Custom UI data types for the data stream
// ─────────────────────────────────────────────────────────────────────────────

export type CustomUIDataTypes = {
    "chat-title": string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Chat message type (used throughout the chat module)
// ─────────────────────────────────────────────────────────────────────────────

export type ChatMessage = UIMessage<MessageMetadata, CustomUIDataTypes>;

// ─────────────────────────────────────────────────────────────────────────────
// Attachment type
// ─────────────────────────────────────────────────────────────────────────────

export type Attachment = {
    name: string;
    url: string;
    contentType: string;
};
