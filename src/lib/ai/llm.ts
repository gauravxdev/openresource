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
    oneLiner: string;
    longDescription: string;
    categories: string[];
    tags: string[];
    builtWith: { name: string; slug: string }[];
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
- **Length**: Maximum 25 words. Keep it brief but descriptive.
- Example: "Native terminal UI AI coding agent with LSP support, multi-session capability, shareable links, and compatibility with 75+ LLM providers."
- No markdown formatting.

### 2. One Liner
- A punchy, marketing-style one-liner.
- Example: "Share files securely across all your devices with a self-hosted server."
- Max 100 characters.

### 3. Long Description (MDX)
- A detailed, high-impact overview of the project.
- **Length**: 200-300 words.
- **Format**: Use MDX features like bolding and lists. Do *not* use h1 (#) or h2 (##). Start with h3 (###) if needed.
- **Tone**: Professional, technical, and objective.

**Structure Guide:**
1.  **Overview**: 2 paragraphs defining the project in detail, its background, and its core value.
2.  **Key Features**: A detailed bulleted list of 5-7 essential capabilities.
    - Format: "- **Feature**: Detailed explanation of how it works and its benefits"
3.  **Use Case**: 2-3 sentences on who it's for and when to use it.

**Style Rules:**
- Use **bold** for key technologies.
- Focus strictly on facts from the signals.
- No fluff or introductory filler.

### 4. Categories
- Suggest 3-5 relevant categories (e.g., "Developer Tools", "AI Coding Assistants", "Terminal Apps")
- Capitalize properly

### 5. Tags
- Provide 5-8 relevant SEO-friendly tags (e.g., "llm", "automation", "cli")
- Lowercase, no spaces (use hyphens if needed)

### 6. Built With (Tech Stack)
- Identify the core technologies, frameworks, and tools used.
- For each, provide the human-readable name (e.g., "Next.js") and a "slug" that matches the [Simple Icons](https://simpleicons.org/) slug (e.g., "nextdotjs").
- Include 4-10 items.
- Examples: { "name": "React", "slug": "react" }, { "name": "PostgreSQL", "slug": "postgresql" }

## General Guidelines
- Be accurate - only mention features evident from the signals.
- If signals are sparse, infer reasonable capabilities based on the tech stack and project type, but do not hallucinate specific unsupported features.
`;

const descriptionSchema = z.object({
    shortDescription: z.string().describe("A concise 1-2 sentence description. Max 25 words."),
    oneLiner: z.string().describe("A punchy 1-sentence one-liner description."),
    longDescription: z.string().describe("A detailed description in MDX format with headings and formatting."),
    categories: z.array(z.string()).describe("3-5 relevant categories for the resource."),
    tags: z.array(z.string()).describe("5-8 relevant tags."),
    builtWith: z.array(z.object({
        name: z.string().describe("Human readable name of the technology."),
        slug: z.string().describe("Simple Icons slug for the technology."),
    })).describe("The tech stack used to build the project."),
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
        oneLiner: object.oneLiner,
        longDescription: object.longDescription,
        categories: object.categories,
        tags: object.tags,
        builtWith: object.builtWith,
        model: response.modelId ?? MODEL,
    };
}
