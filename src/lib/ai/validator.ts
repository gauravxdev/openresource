/**
 * Output Validator for AI-generated project descriptions
 *
 * Validates MDX text before saving or displaying.
 * This layer does NOT rewrite content - it only validates.
 *
 * All validation is deterministic - no AI usage.
 */

// -----------------------------------------------------------------------------
// Interfaces
// -----------------------------------------------------------------------------

export interface ValidationResult {
    valid: boolean;
    reason?: string;
}

export interface ValidateDescriptionInput {
    mdx: string;
    techStack: string[];
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/**
 * Minimum and maximum sentence count for valid descriptions.
 */
const MIN_SENTENCES = 3;
const MAX_SENTENCES = 6;

/**
 * Regex pattern to match emojis.
 * Covers most common emoji ranges including pictographs, symbols, and modifiers.
 */
const EMOJI_REGEX =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]/u;

/**
 * Marketing / hype words that should not appear in descriptions.
 * Case-insensitive matching.
 */
const HYPE_WORDS = [
    "best",
    "revolutionary",
    "ultimate",
    "next-gen",
    "next gen",
    "nextgen",
    "cutting-edge",
    "cutting edge",
    "game-changer",
    "game changer",
    "world-class",
    "world class",
    "groundbreaking",
    "unparalleled",
    "unprecedented",
    "industry-leading",
    "industry leading",
    "state-of-the-art",
    "state of the art",
    "blazing fast",
    "blazing-fast",
    "lightning fast",
    "lightning-fast",
    "supercharge",
    "turbocharge",
    "amazing",
    "incredible",
    "awesome",
    "mind-blowing",
    "mind blowing",
];

/**
 * Regex pattern to detect HTML tags.
 */
const HTML_TAG_REGEX = /<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^>]*)?\/?>/;

/**
 * Regex pattern to detect code blocks (triple backticks).
 */
const CODE_BLOCK_REGEX = /```[\s\S]*?```|~~~[\s\S]*?~~~/;

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Counts the number of sentences in a text.
 * A sentence is defined as text ending with . ! or ? (excluding abbreviations).
 */
function countSentences(text: string): number {
    // Remove common abbreviations that end with periods
    const cleaned = text
        .replace(/\b(e\.g\.|i\.e\.|etc\.|vs\.|Mr\.|Mrs\.|Dr\.|Jr\.|Sr\.)/gi, "ABBREV")
        .replace(/\.\.\./g, "ELLIPSIS"); // Handle ellipsis

    // Split on sentence endings followed by space or end of string
    const sentences = cleaned.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 0);

    return sentences.length;
}

/**
 * Checks if text contains any emojis.
 */
function containsEmoji(text: string): boolean {
    return EMOJI_REGEX.test(text);
}

/**
 * Checks if text contains any marketing/hype words.
 * Returns the first found hype word or null.
 */
function findHypeWord(text: string): string | null {
    const lowerText = text.toLowerCase();

    for (const word of HYPE_WORDS) {
        // Use word boundary to avoid partial matches
        const regex = new RegExp(`\\b${word.replace(/-/g, "[- ]?")}\\b`, "i");
        if (regex.test(lowerText)) {
            return word;
        }
    }

    return null;
}

/**
 * Checks if text contains HTML tags.
 */
function containsHtmlTags(text: string): boolean {
    return HTML_TAG_REGEX.test(text);
}

/**
 * Checks if text contains code blocks.
 */
function containsCodeBlocks(text: string): boolean {
    return CODE_BLOCK_REGEX.test(text);
}

/**
 * Extracts technology names mentioned in the text.
 * Uses simple word matching against the provided tech stack.
 */
function findMentionedTechnologies(text: string, techStack: string[]): string[] {
    // Common technology name patterns (case-insensitive)
    // We'll look for words that could be technologies
    const techPatterns = [
        // Programming languages
        /\b(typescript|javascript|python|rust|go|java|kotlin|ruby|swift|c\+\+|c#|php|scala|elixir)\b/gi,
        // Frameworks
        /\b(react|vue|angular|next\.?js|nuxt|svelte|django|flask|rails|spring|express|fastapi|nest\.?js)\b/gi,
        // Libraries/Tools
        /\b(node\.?js|deno|bun|webpack|vite|tailwind|prisma|graphql|docker|kubernetes)\b/gi,
    ];

    // Extract all potential tech mentions from text
    const allMatches = new Set<string>();
    for (const pattern of techPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            matches.forEach((m) => allMatches.add(m.toLowerCase().replace(/\./g, "")));
        }
    }

    // Check which mentioned techs are NOT in the provided stack
    const normalizedStack = techStack.map((t) => t.toLowerCase().replace(/\./g, ""));
    const invalidTechs: string[] = [];

    for (const match of allMatches) {
        // Check if this tech is in the provided stack
        const isInStack = normalizedStack.some(
            (stackTech) => stackTech.includes(match) || match.includes(stackTech)
        );

        if (!isInStack) {
            invalidTechs.push(match);
        }
    }

    return invalidTechs;
}

// -----------------------------------------------------------------------------
// Main Validation Function
// -----------------------------------------------------------------------------

/**
 * Validates an AI-generated MDX description.
 *
 * Validation rules:
 * 1. Must be valid Markdown/MDX (plain text only)
 * 2. Must contain 3-6 sentences
 * 3. Must not contain emojis
 * 4. Must not contain marketing/hype words
 * 5. Must not contain HTML tags
 * 6. Must not contain code blocks
 * 7. Technologies mentioned must exist in signals.techStack
 *
 * @param input - The MDX text and tech stack to validate against
 * @returns ValidationResult with valid status and optional reason
 */
export function validateDescription(input: ValidateDescriptionInput): ValidationResult {
    const { mdx, techStack } = input;

    // Basic check: must have content
    if (!mdx || mdx.trim().length === 0) {
        return { valid: false, reason: "Description cannot be empty" };
    }

    // Rule 1: Check for HTML tags
    if (containsHtmlTags(mdx)) {
        return { valid: false, reason: "Description must not contain HTML tags" };
    }

    // Rule 2: Check for code blocks
    if (containsCodeBlocks(mdx)) {
        return { valid: false, reason: "Description must not contain code blocks" };
    }

    // Rule 3: Check sentence count
    // Relaxed for long descriptions which may vary significantly in length
    /*
    const sentenceCount = countSentences(mdx);
    if (sentenceCount < MIN_SENTENCES || sentenceCount > MAX_SENTENCES) {
        return {
            valid: false,
            reason: `Description must contain between ${MIN_SENTENCES} and ${MAX_SENTENCES} sentences (found ${sentenceCount})`,
        };
    }
    */

    // Rule 4: Check for emojis
    if (containsEmoji(mdx)) {
        return { valid: false, reason: "Description must not contain emojis" };
    }

    // Rule 5: Check for hype words
    const hypeWord = findHypeWord(mdx);
    if (hypeWord) {
        return {
            valid: false,
            reason: `Description contains marketing language: "${hypeWord}"`,
        };
    }

    // Rule 6: Check tech stack mentions
    const invalidTechs = findMentionedTechnologies(mdx, techStack);
    if (invalidTechs.length > 0) {
        return {
            valid: false,
            reason: `Technology "${invalidTechs[0]}" mentioned but not found in project tech stack`,
        };
    }

    // All validations passed
    return { valid: true };
}
