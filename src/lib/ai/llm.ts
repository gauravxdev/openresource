import { generateText } from "ai";
import { mistral } from "@ai-sdk/mistral";

// ─────────────────────────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface LLMWriterInput {
    prompt: string;
}

export interface LLMWriterOutput {
    description: string;
    model: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MODEL = "mistral-small-latest";
const TEMPERATURE = 0.3;
const SYSTEM_MESSAGE = `You are an expert technical writer for open-source software.

Your task is to write a short project description in **MDX (Markdown)** format,
based only on the information provided.

Rules:
- Output must be valid Markdown / MDX.
- Use plain paragraphs only (no HTML).
- Do NOT invent features, capabilities, or use-cases.
- If information is unclear or missing, state this explicitly.
- Avoid marketing language, hype, and superlatives.
- Do not use emojis.
- Keep the description concise (3–6 sentences).
- Use a neutral, professional tone.
- Mention technologies only if they are explicitly provided.
- Do not add headings unless explicitly instructed.

Output format:
- Plain Markdown paragraphs
- No code blocks
- No lists unless the prompt explicitly asks for them
`;

// ─────────────────────────────────────────────────────────────────────────────
// Main Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a prompt to Mistral and returns a clean description string.
 * This is a simple passthrough layer with no business logic.
 */
export async function writeDescriptionWithLLM(
    input: LLMWriterInput
): Promise<LLMWriterOutput> {
    const { text, response } = await generateText({
        model: mistral(MODEL),
        temperature: TEMPERATURE,
        system: SYSTEM_MESSAGE,
        prompt: input.prompt,
    });

    const description = text.trim();

    if (description.length === 0) {
        throw new Error("Mistral API returned an empty description");
    }

    return {
        description,
        model: response.modelId ?? MODEL,
    };
}
