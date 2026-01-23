/**
 * Prompt Builder Layer
 *
 * Sits between Signal Builder and LLM Writer.
 * Dynamically constructs writing instructions for the LLM based on
 * structured signals extracted from a GitHub repository.
 *
 * Key principles:
 * - No hardcoded repo type mappings
 * - Adapts dynamically to signal strength and completeness
 * - Deterministic and readable
 */

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface RepoSignals {
    repoType?: string; // weak hint, may be undefined or unreliable
    projectGoal: string;
    techStack: string[];
    maintenance: "active" | "inactive";
    maturity: "experimental" | "stable";
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/**
 * Fallback text that indicates project goal is not clearly documented.
 */
const UNDOCUMENTED_GOAL_TEXT = "The purpose of this project is not clearly documented.";

/**
 * Minimum length for a goal to be considered "clear".
 */
const MIN_CLEAR_GOAL_LENGTH = 30;

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Determines if the project goal is clear and specific.
 */
function isGoalClear(projectGoal: string): boolean {
    const trimmed = projectGoal.trim();

    // Fallback text means unclear
    if (trimmed === UNDOCUMENTED_GOAL_TEXT) {
        return false;
    }

    // Too short means unclear
    if (trimmed.length < MIN_CLEAR_GOAL_LENGTH) {
        return false;
    }

    return true;
}

/**
 * Determines overall signal confidence level.
 * Returns "high" if goal is clear AND techStack is present.
 * Returns "low" otherwise.
 */
function getConfidenceLevel(signals: RepoSignals): "high" | "low" {
    const goalClear = isGoalClear(signals.projectGoal);
    const hasTechStack = signals.techStack.length > 0;

    return goalClear && hasTechStack ? "high" : "low";
}

/**
 * Builds the confidence instruction based on signal strength.
 */
function buildConfidenceInstruction(confidence: "high" | "low"): string {
    if (confidence === "high") {
        return `You may use direct, confident language when describing what the project does.`;
    }

    return `Use cautious language (e.g., "appears to", "is intended to", "seems to") since the available information is limited or unclear.`;
}

/**
 * Builds the opening instruction.
 * Does NOT hardcode specific repo types.
 */
function buildOpeningInstruction(signals: RepoSignals, confidence: "high" | "low"): string {
    const lines: string[] = [];

    lines.push(`Choose a neutral, accurate opening based only on the facts provided.`);
    lines.push(`Do NOT start with generic phrases like "This is a" or "This project is".`);

    if (signals.repoType) {
        lines.push(`A repo type hint "${signals.repoType}" is available, but treat it as a weak signal. Only use it if it genuinely clarifies the opening.`);
    }

    if (confidence === "low") {
        lines.push(`If the purpose is unclear, acknowledge uncertainty in the opening sentence.`);
    }

    return lines.join(" ");
}

/**
 * Formats the facts section that will be passed to the LLM.
 */
function buildFactsSection(signals: RepoSignals): string {
    const lines: string[] = [];

    lines.push(`FACTS (base your description strictly on these):`);
    lines.push(`- Project Goal: ${signals.projectGoal}`);
    lines.push(`- Tech Stack: ${signals.techStack.length > 0 ? signals.techStack.join(", ") : "not specified"}`);
    lines.push(`- Maturity: ${signals.maturity}`);
    lines.push(`- Maintenance: ${signals.maintenance}`);

    if (signals.repoType) {
        lines.push(`- Repo Type (weak hint): ${signals.repoType}`);
    }

    return lines.join("\n");
}

/**
 * Builds the writing constraints section.
 */
function buildConstraintsSection(): string {
    return `WRITING CONSTRAINTS:
- Output must be valid MDX (Markdown).
- Write 3–6 sentences only.
- Use plain paragraphs only (no HTML, no code blocks, no lists).
- Maintain a neutral, professional tone.
- No emojis.
- No marketing or hype language (avoid words like "best", "revolutionary", "amazing").
- Do NOT invent features, use-cases, or technologies not mentioned in the facts.
- Only mention technologies explicitly listed in the Tech Stack.`;
}

// -----------------------------------------------------------------------------
// Main Function
// -----------------------------------------------------------------------------

/**
 * Builds a dynamic prompt string for the LLM based on repository signals.
 *
 * This function:
 * - Adapts to signal strength (confidence handling)
 * - Does not hardcode repo type mappings
 * - Returns a deterministic prompt string
 *
 * @param signals - Structured signals from the Signal Builder
 * @returns A prompt string ready to be sent to the LLM
 */
export function buildPrompt(signals: RepoSignals): string {
    const confidence = getConfidenceLevel(signals);

    const sections: string[] = [
        `Write a short project description for a software discovery platform.`,
        ``,
        buildFactsSection(signals),
        ``,
        `INSTRUCTIONS:`,
        buildConfidenceInstruction(confidence),
        buildOpeningInstruction(signals, confidence),
        ``,
        buildConstraintsSection(),
    ];

    return sections.join("\n");
}
