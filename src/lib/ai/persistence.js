/**
 * Persistence Layer for AI-generated project descriptions
 *
 * Stores generated descriptions with metadata to avoid re-generation
 * and enable transparency.
 *
 * All operations are deterministic - no AI usage.
 */
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
export function calculateAiConfidence(signals) {
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
    }
    else if (score === 2) {
        return "medium";
    }
    else {
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
class InMemoryRepository {
    records = new Map();
    async save(record) {
        this.records.set(record.repoUrl, record);
    }
    async findByRepoUrl(repoUrl) {
        return this.records.get(repoUrl) ?? null;
    }
}
// Default repository instance (can be replaced via dependency injection)
let repository = new InMemoryRepository();
/**
 * Sets the repository implementation.
 * Use this to inject a database-backed repository in production.
 */
export function setRepository(repo) {
    repository = repo;
}
/**
 * Gets the current repository implementation.
 */
export function getRepository() {
    return repository;
}
/**
 * Creates an AI description record with calculated confidence.
 *
 * @param params - Parameters for creating the record
 * @returns Complete AI description record
 */
export function createAiDescriptionRecord(params) {
    return {
        repoUrl: params.repoUrl,
        descriptionMdx: params.descriptionMdx,
        shortDescription: params.shortDescription,
        oneLiner: params.oneLiner, // [NEW]
        categories: params.categories,
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
export async function saveAiDescription(record) {
    await repository.save(record);
}
/**
 * Finds a previously generated description by repository URL.
 *
 * @param repoUrl - The repository URL to search for
 * @returns The stored record or null if not found
 */
export async function findAiDescription(repoUrl) {
    return await repository.findByRepoUrl(repoUrl);
}
