import { z } from "zod";
// ─────────────────────────────────────────────────────────────────────────────
// Message metadata
// ─────────────────────────────────────────────────────────────────────────────
export const messageMetadataSchema = z.object({
    createdAt: z.string(),
});
