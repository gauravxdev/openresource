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

const MODEL = "mistral-small-latest";
const TEMPERATURE = 0.3;
const SYSTEM_MESSAGE = `You are an expert technical writer for open-source software directories like OpenAlternative.

Your task is to analyze the provided repository signals and generate a structured description package.

## Output Format

### 1. Short Description
- A concise 1-2 sentence summary for display in cards/lists.
- Example: "Native terminal UI AI coding agent with LSP support, multi-session capability, shareable links, and compatibility with 75+ LLM providers."
- No markdown formatting.

### 2. Long Description (4-6 paragraphs, Markdown)
Structure it EXACTLY like this real example:

---
[Project name] is a sophisticated [category] designed specifically for [target audience], offering developers a powerful alternative to [traditional solutions].

The tool features [main feature 1] that's [benefit], providing [value proposition]. With [feature 2], [project name] intelligently [does what] for enhanced [benefit] across [use case].

Key capabilities include:
- **[Feature name]** - [One line description of what it does and why it matters]
- **[Feature name]** - [One line description]
- **[Feature name]** - [One line description]
- **[Feature name]** - [One line description]

Installation is straightforward with [installation methods]. The [installation benefit] makes getting started quick and easy.

Whether you're working on [use case 1] or need [use case 2], [project name] brings [value] directly to your [workflow], maintaining the efficiency and familiarity of [domain].
---

Rules for Long Description:
- Write 4-6 substantial paragraphs (NOT headers, just flowing prose with one bulleted section)
- Use **bold** for key terms and feature names in the bullet list
- The "Key capabilities include:" section MUST have 4-6 bullet points
- Each bullet starts with "**Feature Name** - " followed by description
- NO headings (##, ###) - just paragraphs
- NO code blocks
- Professional, neutral tone - no hype words
- Be specific about what the tool does, not vague

### 3. Categories
- Suggest 3-5 relevant categories (e.g., "Developer Tools", "AI Coding Assistants", "Terminal Apps")
- Capitalize properly

## General Guidelines
- Be accurate - only mention features evident from the signals
- Neutral, professional, informative tone
- No marketing superlatives ("best", "revolutionary", etc.)
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
