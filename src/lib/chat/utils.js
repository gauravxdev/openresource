import { ChatError } from "./errors";
export function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
export function sanitizeText(text) {
    return text.replace("<has_function_call>", "");
}
export async function fetchWithErrorHandlers(input, init) {
    try {
        const response = await fetch(input, init);
        if (!response.ok) {
            const { code, cause } = await response.json();
            throw new ChatError(code, cause);
        }
        return response;
    }
    catch (error) {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
            throw new ChatError("offline:chat");
        }
        throw error;
    }
}
export function getTextFromMessage(message) {
    return message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("");
}
export function getMostRecentUserMessage(messages) {
    const userMessages = messages.filter((message) => message.role === "user");
    return userMessages.at(-1);
}
