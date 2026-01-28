/**
 * AI Description Generator API Handler
 *
 * This is the orchestration layer that connects all AI pipeline components.
 * It contains NO business logic - only coordination of existing layers.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

// GitHub Ingestion Layer
import {
    getRepoDetails,
    getReadmeFile,
    getRepoStructure,
    getLanguages,
    getReleaseCount,
} from "@/lib/github";

// AI Pipeline Layers
import { classifyRepo } from "@/lib/ai/classifier";
import { buildRepoSignals } from "@/lib/ai/signals";
import { buildPrompt } from "@/lib/ai/prompts";
import { writeDescriptionWithLLM } from "@/lib/ai/llm";
import { validateDescription } from "@/lib/ai/validator";
import {
    createAiDescriptionRecord,
    saveAiDescription,
    findAiDescription,
} from "@/lib/ai/persistence";

// ─────────────────────────────────────────────────────────────────────────────
// Input Schema
// ─────────────────────────────────────────────────────────────────────────────

const generateDescriptionInput = z.object({
    repoUrl: z.string().url("Please provide a valid GitHub repository URL"),
});

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Parse GitHub URL
// ─────────────────────────────────────────────────────────────────────────────

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    try {
        const parsed = new URL(url);
        if (!parsed.hostname.includes("github.com")) {
            return null;
        }
        const parts = parsed.pathname.split("/").filter(Boolean);
        if (parts.length < 2) {
            return null;
        }
        return { owner: parts[0]!, repo: parts[1]! };
    } catch {
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────────────

export const aiRouter = createTRPCRouter({
    /**
     * Generates an AI-powered description for a GitHub repository.
     * Orchestrates the full pipeline: fetch → classify → signal → prompt → generate → validate → persist
     */
    generateDescription: publicProcedure
        .input(generateDescriptionInput)
        .mutation(async ({ input }) => {
            const { repoUrl } = input;

            // Step 0: Parse GitHub URL
            const parsed = parseGitHubUrl(repoUrl);
            if (!parsed) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid GitHub repository URL",
                });
            }
            const { owner, repo } = parsed;

            // Check cache first
            const cached = await findAiDescription(repoUrl);
            if (cached) {
                return {
                    description: cached.descriptionMdx,
                    shortDescription: cached.shortDescription,
                    categories: cached.categories,
                    repoType: cached.repoType,
                    confidence: cached.aiConfidence,
                    model: cached.model,
                    cached: true,
                    // GitHub stats are not cached, so they will be null
                    githubStats: null,
                };
            }

            // Step 1: Fetch GitHub data (parallel where possible)
            const [repoDetails, readmeContent, fileList, languages, releaseCount] =
                await Promise.all([
                    getRepoDetails(owner, repo),
                    getReadmeFile(owner, repo).catch(() => undefined),
                    getRepoStructure(owner, repo).catch(() => undefined),
                    getLanguages(owner, repo),
                    getReleaseCount(owner, repo),
                ]);

            if (!repoDetails) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Repository not found or inaccessible",
                });
            }

            // Step 2: Run repo classifier
            const classification = classifyRepo({
                name: repoDetails.name,
                description: repoDetails.description,
                topics: repoDetails.topics,
                readmeContent,
                fileList,
            });

            // Step 3: Build signals from GitHub data + classification
            const signals = buildRepoSignals({
                repoDetails: {
                    description: repoDetails.description,
                    updated_at: repoDetails.updated_at,
                },
                readmeContent,
                languages,
                releaseCount,
                classification: { type: classification.type },
            });

            // Step 4: Build prompt from signals
            const prompt = buildPrompt({
                repoType: signals.repoType,
                projectGoal: signals.projectGoal,
                techStack: signals.techStack,
                maintenance: signals.maintenance,
                maturity: signals.maturity,
            });

            // Step 5: Generate description using LLM
            const llmOutput = await writeDescriptionWithLLM({ prompt });

            // Step 6: Validate AI output
            const validation = validateDescription({
                mdx: llmOutput.longDescription,
                techStack: signals.techStack,
            });

            if (!validation.valid) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `AI output validation failed: ${validation.reason}`,
                });
            }

            // Step 7: Persist description and metadata
            const record = createAiDescriptionRecord({
                repoUrl,
                descriptionMdx: llmOutput.longDescription,
                shortDescription: llmOutput.shortDescription,
                categories: llmOutput.categories,
                repoType: classification.type,
                signals,
                model: llmOutput.model,
            });
            await saveAiDescription(record);

            // Step 8: Return result to frontend
            return {
                description: llmOutput.longDescription,
                shortDescription: llmOutput.shortDescription,
                categories: llmOutput.categories,
                repoType: classification.type,
                confidence: record.aiConfidence,
                model: llmOutput.model,
                cached: false,
                githubStats: {
                    stars: repoDetails.stargazers_count,
                    forks: repoDetails.forks_count,
                    lastCommit: repoDetails.updated_at,
                    repositoryCreatedAt: repoDetails.created_at,
                    license: repoDetails.license?.spdx_id ?? repoDetails.license?.name ?? null,
                },
            };
        }),
});
