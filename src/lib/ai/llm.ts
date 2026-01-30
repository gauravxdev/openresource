import { generateObject } from "ai";
import { mistral } from "@ai-sdk/mistral";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface LLMWriterInput {
    prompt: string;
}

export interface LLMWriterOutput {
    shortDescription: string;
    oneLiner: string; // [NEW] added oneLiner
    longDescription: string;
    categories: string[];
    model: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MODEL = "mistral-large-latest";
const TEMPERATURE = 0.3;
const SYSTEM_MESSAGE = `You are an expert technical writer for open-source software directories like OpenAlternative.

Your task is to analyze the provided repository signals and generate a structured description package.

## Output Format

### 1. Short Description
- A concise 1 sentence summary for display in cards/lists.
- Example: "Native terminal UI AI coding agent with LSP support, multi-session capability, shareable links, and compatibility with 75+ LLM providers."
- No markdown formatting.

### 2. One Liner
- A punchy, marketing-style one-liner.
- Example: "Share files securely across all your devices with a self-hosted server."
- Max 100 characters.

### 3. Long Description (MDX)
- A highly detailed, comprehensive overview associated with the project.
- **Length**: 250-350 words (approx. 3-5 paragraphs).
- **Format**: Use MDX features like bolding, lists, and clear structure. Do *not* use h1 (#) or h2 (##). Start with h3 (###) if needed, or just use bolded terms for section leads.
- **Tone**: Professional, informative, yet engaging. Avoid marketing fluff but clearly articulate value.

**Structure Guide:**
1.  **Introduction**: A strong but concise opening hook defining the project and core value. (1 paragraph)
2.  **Core Value & Architecture**: Brief technical approach and architecture. (1 paragraph)
3.  **Key Features**: A bulleted list of 4-6 key capabilities.
    - Start each feature with a bullet point: "- **Feature Name**: Explanation"
4.  **Use Cases**: Brief description of who benefits most. (1 paragraph)
5.  **Conclusion**: A final summary statement.

**Style Rules:**
- Use **bold** for emphasis on key technologies or benefits.
- Ensure smooth transitions between paragraphs.
- Focus on *substance*: mention specific languages, protocols (e.g., MCP, LSP), or integration points found in the signals.

### 3. Categories
- Suggest 3-5 relevant categories (e.g., "Developer Tools", "AI Coding Assistants", "Terminal Apps")
- Capitalize properly

## General Guidelines
- Be accurate - only mention features evident from the signals.
- If signals are sparse, infer reasonable capabilities based on the tech stack and project type, but do not hallucinate specific unsupported features.
`;

const descriptionSchema = z.object({
    shortDescription: z.string().describe("A concise 1-2 sentence description."),
    oneLiner: z.string().describe("A punchy 1-sentence one-liner description."),
    longDescription: z.string().describe("A detailed description in MDX format with headings and formatting."),
    categories: z.array(z.string()).describe("3-5 relevant categories for the resource."),
});

// ─────────────────────────────────────────────────────────────────────────────
// Main Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a prompt to Mistral and returns a structured description object.
 */
export async function writeDescriptionWithLLM(
    input: LLMWriterInput
): Promise<LLMWriterOutput> {
    const { object, response } = await generateObject({
        model: mistral(MODEL),
        temperature: TEMPERATURE,
        system: SYSTEM_MESSAGE,
        mode: "json",
        prompt: input.prompt,
        schema: descriptionSchema,
    });

    return {
        shortDescription: object.shortDescription,
        oneLiner: object.oneLiner,
        longDescription: object.longDescription,
        categories: object.categories,
        model: response.modelId ?? MODEL,
    };
}
