import { auth } from "@/lib/auth";
import { ChatError } from "@/lib/chat/errors";
import {
    getChatsByUserId,
    deleteAllChatsByUserId,
} from "@/lib/chat/queries";
import { headers } from "next/headers";

// ─────────────────────────────────────────────────────────────────────────────
// GET handler - Paginated chat history
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
    try {
        const headersList = await headers();
        const session = await auth.api.getSession({
            headers: headersList,
        });

        if (!session?.user) {
            return new ChatError("unauthorized:chat").toResponse();
        }

        const { searchParams } = new URL(request.url);
        const limit = Math.min(
            Number.parseInt(searchParams.get("limit") || "20"),
            50,
        );
        const endingBefore = searchParams.get("ending_before");

        const { chats, hasMore } = await getChatsByUserId({
            userId: session.user.id,
            limit,
            cursor: endingBefore || undefined,
        });

        return Response.json({ chats, hasMore });
    } catch (error) {
        console.error("Failed to fetch chat history:", error);
        return new ChatError("bad_request:api").toResponse();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE handler - Delete all chats for user
// ─────────────────────────────────────────────────────────────────────────────

export async function DELETE() {
    try {
        const headersList = await headers();
        const session = await auth.api.getSession({
            headers: headersList,
        });

        if (!session?.user) {
            return new ChatError("unauthorized:chat").toResponse();
        }

        const result = await deleteAllChatsByUserId({
            userId: session.user.id,
        });

        return Response.json({ success: true, ...result });
    } catch (error) {
        console.error("Failed to delete all chats:", error);
        return new ChatError("bad_request:api").toResponse();
    }
}
