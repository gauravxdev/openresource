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
- A concise 1-2 sentence summary for display in cards/lists.
- Example: "Native terminal UI AI coding agent with LSP support, multi-session capability, shareable links, and compatibility with 75+ LLM providers."
- No markdown formatting.

### 2. Long Description (MDX)
- A highly detailed, comprehensive overview associated with the project.
- **Length**: 500+ words (approx. 6-8 substantial paragraphs).
- **Format**: Use MDX features like bolding, lists, and clear structure. Do *not* use h1 (#) or h2 (##). Start with h3 (###) if needed, or just use bolded terms for section leads.
- **Tone**: Professional, informative, yet engaging. Avoid marketing fluff but clearly articulate value.

**Structure Guide:**
1.  **Introduction**: A strong opening hook defining what the project is, who it's for, and the core problem it solves. (2 paragraphs)
2.  **Core Value & Architecture**: Detail the technical approach, architecture (e.g., "Built with Rust and React..."), and why this approach is superior or interesting. (2 paragraphs)
3.  **Key Features**: A comprehensive, bulleted list of 5-8 key capabilities. Use **bold** for the feature name.
    - **Feature Name**: Detailed explanation.
    - **Feature Name**: Detailed explanation.
4.  **Use Cases & User Experience**: Describe the typical workflow and who benefits most (e.g., "Ideal for DevOps engineers who..."). (1-2 paragraphs)
5.  **Conclusion**: A final summary statement reinforcing the open-source nature and community aspect.

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
        prompt: input.prompt,
        schema: descriptionSchema,
    });

    return {
        shortDescription: object.shortDescription,
        longDescription: object.longDescription,
        categories: object.categories,
        model: response.modelId ?? MODEL,
    };
}
