/**
 * Persistence Layer for AI-generated project descriptions
 *
 * Stores generated descriptions with metadata to avoid re-generation
 * and enable transparency.
 *
 * All operations are deterministic - no AI usage.
 */

import type { RepoType } from "./classifier";
import type { RepoSignals } from "./signals";

// -----------------------------------------------------------------------------
// Interfaces
// -----------------------------------------------------------------------------

export type AiConfidence = "low" | "medium" | "high";

export interface AiDescriptionRecord {
    repoUrl: string;
    descriptionMdx: string;
    repoType: RepoType;
    signals: RepoSignals;
    model: string;
    aiConfidence: AiConfidence;
    generatedAt: string;
}

/**
 * Database abstraction interface.
 * Implement this to connect to your actual database.
 */
export interface AiDescriptionRepository {
    save(record: AiDescriptionRecord): Promise<void>;
    findByRepoUrl(repoUrl: string): Promise<AiDescriptionRecord | null>;
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/**
 * Fallback text that indicates project goal is not clearly documented.
 * Used to determine if projectGoal was properly extracted.
 */
const UNDOCUMENTED_GOAL_TEXT = "The purpose of this project is not clearly documented.";

// -----------------------------------------------------------------------------
// Confidence Scoring
// -----------------------------------------------------------------------------

/**
 * Calculates AI confidence score based on repository signals.
 *
 * Scoring rules (deterministic):
 * - +1 if projectGoal is clearly documented (not fallback text)
 * - +1 if techStack is not empty
 * - +1 if maintenance === "active"
 *
 * Mapping:
 * - 3 → high
 * - 2 → medium
 * - 0-1 → low
 *
 * @param signals - Repository signals from signal builder
 * @returns Confidence level
 */
export function calculateAiConfidence(signals: RepoSignals): AiConfidence {
    let score = 0;

    // +1 if projectGoal is clearly documented
    if (signals.projectGoal && signals.projectGoal.trim() !== UNDOCUMENTED_GOAL_TEXT) {
        score += 1;
    }

    // +1 if techStack is not empty
    if (signals.techStack && signals.techStack.length > 0) {
        score += 1;
    }

    // +1 if maintenance is active
    if (signals.maintenance === "active") {
        score += 1;
    }

    // Map score to confidence level
    if (score === 3) {
        return "high";
    } else if (score === 2) {
        return "medium";
    } else {
        return "low";
    }
}

// -----------------------------------------------------------------------------
// Persistence Functions
// -----------------------------------------------------------------------------

/**
 * In-memory repository for development/testing.
 * Replace with actual database implementation in production.
 */
class InMemoryRepository implements AiDescriptionRepository {
    private records = new Map<string, AiDescriptionRecord>();

    async save(record: AiDescriptionRecord): Promise<void> {
        this.records.set(record.repoUrl, record);
    }

    async findByRepoUrl(repoUrl: string): Promise<AiDescriptionRecord | null> {
        return this.records.get(repoUrl) ?? null;
    }
}

// Default repository instance (can be replaced via dependency injection)
let repository: AiDescriptionRepository = new InMemoryRepository();

/**
 * Sets the repository implementation.
 * Use this to inject a database-backed repository in production.
 */
export function setRepository(repo: AiDescriptionRepository): void {
    repository = repo;
}

/**
 * Gets the current repository implementation.
 */
export function getRepository(): AiDescriptionRepository {
    return repository;
}

/**
 * Creates an AI description record with calculated confidence.
 *
 * @param params - Parameters for creating the record
 * @returns Complete AI description record
 */
export function createAiDescriptionRecord(params: {
    repoUrl: string;
    descriptionMdx: string;
    repoType: RepoType;
    signals: RepoSignals;
    model: string;
}): AiDescriptionRecord {
    return {
        repoUrl: params.repoUrl,
        descriptionMdx: params.descriptionMdx,
        repoType: params.repoType,
        signals: params.signals,
        model: params.model,
        aiConfidence: calculateAiConfidence(params.signals),
        generatedAt: new Date().toISOString(),
    };
}

/**
 * Saves an AI-generated description record.
 *
 * @param record - The complete record to save
 */
export async function saveAiDescription(record: AiDescriptionRecord): Promise<void> {
    await repository.save(record);
}

/**
 * Finds a previously generated description by repository URL.
 *
 * @param repoUrl - The repository URL to search for
 * @returns The stored record or null if not found
 */
export async function findAiDescription(repoUrl: string): Promise<AiDescriptionRecord | null> {
    return await repository.findByRepoUrl(repoUrl);
}
