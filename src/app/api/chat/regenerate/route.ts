import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ChatError } from "@/lib/chat/errors";
import {
  getMessagesByChatId,
  deleteMessagesByChatIdAfterTimestamp,
  getChatById,
} from "@/lib/chat/queries";
import { z } from "zod";

const regenerateSchema = z.object({
  chatId: z.string(),
  messageId: z.string(),
});

export async function POST(request: Request) {
  let body: z.infer<typeof regenerateSchema>;

  try {
    const json = (await request.json()) as unknown;
    body = regenerateSchema.parse(json);
  } catch {
    return new ChatError("bad_request:api").toResponse();
  }

  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return new ChatError("unauthorized:chat").toResponse();
    }

    const { chatId, messageId } = body;

    // Verify the chat belongs to the user
    const chat = await getChatById({ id: chatId });
    if (!chat) {
      return new ChatError("not_found:chat").toResponse();
    }

    if (chat.userId !== session.user.id) {
      return new ChatError("forbidden:chat").toResponse();
    }

    // Get all messages to find the one to delete
    const messages = await getMessagesByChatId({ id: chatId });
    const messageToDelete = messages.find((m) => m.id === messageId);

    if (!messageToDelete) {
      return Response.json({ success: true, message: "Message not found" });
    }

    // Delete this message and all trailing messages
    await deleteMessagesByChatIdAfterTimestamp({
      chatId,
      timestamp: messageToDelete.createdAt,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Regenerate error:", error);
    return new ChatError("bad_request:api").toResponse();
  }
}
