
import type { RepoType } from './classifier';

export interface RepoSignals {
    repoType: RepoType;
    projectGoal: string;
    techStack: string[];
    maintenance: "active" | "inactive";
    maturity: "experimental" | "stable";
}

export interface SignalBuilderInput {
    repoDetails: {
        description: string | null;
        updated_at: string | null;
        // relevant fields from RepoDetails
    };
    readmeContent: string | undefined;
    languages: Record<string, number>;
    releaseCount: number;
    classification: {
        type: RepoType;
    };
}

/**
 * extracts the technical stack from language usage statistics
 * - Sorts languages by percentage descending
 * - Returns top 2 languages
 * - Does not infer frameworks (relies on upstream provided languages or additional detector if needed,
 *   but per requirements "No AI calls, No embeddings" and "Use languages object", we stick to languages here.
 *   Note: The user request said "Use languages object... do NOT infer frameworks".
 *   However, repo-classification.ts has a `TechStack` detector.
 *   The user requirement says: "Use languages object... Pick top 1-2 languages only".
 *   So I will purely use the provided `languages` map)
 */
function buildTechStack(languages: Record<string, number>): string[] {
    const entries = Object.entries(languages);
    if (entries.length === 0) return [];

    // Sort by bytes/score descending
    const sorted = entries.sort((a, b) => b[1] - a[1]);

    // Take top 2 keys
    return sorted.slice(0, 2).map(([lang]) => lang);
}

/**
 * Determines project goal based on description and README.
 */
function buildProjectGoal(description: string | null, readme: string | undefined): string {
    // 1. Repo description
    if (description && description.trim().length > 0) {
        return description.trim();
    }

    // 2. First meaningful line from README
    if (readme) {
        const lines = readme.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            // Remove markdown headers if present (simple check)
            const cleanLine = trimmed.replace(/^#+\s+/, '').trim();

            if (cleanLine.length > 20) {
                return cleanLine;
            }
        }
    }

    // 3. Fallback
    return "The purpose of this project is not clearly documented.";
}

/**
 * Determines maintenance status based on last update.
 */
function buildMaintenance(updatedAt: string | null): "active" | "inactive" {
    if (!updatedAt) return "inactive";

    const lastUpdate = new Date(updatedAt).getTime();
    const now = Date.now();
    const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;

    return (now - lastUpdate) < sixtyDaysMs ? "active" : "inactive";
}

/**
 * Determines maturity based on releases.
 */
function buildMaturity(releaseCount: number): "stable" | "experimental" {
    return releaseCount > 0 ? "stable" : "experimental";
}

/**
 * Main Signal Builder function.
 * Converts raw GitHub data into clean, AI-ready signals.
 */
export function buildRepoSignals(input: SignalBuilderInput): RepoSignals {
    const { repoDetails, readmeContent, languages, releaseCount, classification } = input;

    return {
        repoType: classification.type,
        projectGoal: buildProjectGoal(repoDetails.description, readmeContent),
        techStack: buildTechStack(languages),
        maintenance: buildMaintenance(repoDetails.updated_at),
        maturity: buildMaturity(releaseCount),
    };
}
