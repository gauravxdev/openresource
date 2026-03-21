
import { PrismaClient, Prisma } from '@prisma/client';
import { getRepoDetails, getReadmeFile, getRepoStructure, getLanguages, getReleaseCount } from '../src/lib/github';
import { classifyRepo } from '../src/lib/ai/classifier';
import { buildRepoSignals } from '../src/lib/ai/signals';
import { buildPrompt } from '../src/lib/ai/prompts';
import { writeDescriptionWithLLM } from '../src/lib/ai/llm';
import dotenv from 'dotenv';

dotenv.config();

const db = new PrismaClient();

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("github.com")) return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0]!, repo: parts[1]! };
  } catch {
    return null;
  }
}

async function main() {
  console.log("Starting resource enrichment...");

  const resources = await db.resource.findMany();

  console.log(`Found ${resources.length} resources to process.`);

  for (const resource of resources) {
    try {
      console.log(`\nProcessing ${resource.name} (${resource.repositoryUrl})...`);
      
      const parsed = parseGitHubUrl(resource.repositoryUrl);
      if (!parsed) {
        console.warn(`Could not parse GitHub URL for ${resource.name}: ${resource.repositoryUrl}`);
        continue;
      }

      const { owner, repo } = parsed;

      console.log(`Fetching data from GitHub for ${owner}/${repo}...`);
      const [repoDetails, readmeContent, fileList, languages, releaseCount] = await Promise.all([
        getRepoDetails(owner, repo),
        getReadmeFile(owner, repo).catch(() => undefined),
        getRepoStructure(owner, repo).catch(() => undefined),
        getLanguages(owner, repo),
        getReleaseCount(owner, repo),
      ]);

      if (!repoDetails) {
        console.warn(`Could not fetch repo details for ${resource.name}`);
        continue;
      }

      console.log(`Generating AI signals and prompts...`);
      const classification = classifyRepo({
        name: repoDetails.name,
        description: repoDetails.description,
        topics: repoDetails.topics,
        readmeContent,
        fileList,
      });

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

      const prompt = buildPrompt(signals);
      
      console.log(`Calling LLM for tags and tech stack...`);
      const llmOutput = await writeDescriptionWithLLM({ prompt });

      console.log(`Updating database for ${resource.name}...`);
      await db.resource.update({
        where: { id: resource.id },
        data: {
          tags: llmOutput.tags,
          builtWith: llmOutput.builtWith as any,
          // We also update shortDescription and oneLiner if they are missing
          shortDescription: resource.shortDescription || llmOutput.shortDescription,
          oneLiner: resource.oneLiner || llmOutput.oneLiner,
        }
      });

      console.log(`Successfully enriched ${resource.name}`);
      console.log(`Tags: ${llmOutput.tags.join(', ')}`);
      console.log(`Built With: ${llmOutput.builtWith.map(t => t.name).join(', ')}`);
    } catch (error) {
      console.error(`Failed to enrich ${resource.name}:`, error);
    }
  }

  console.log("\nEnrichment complete.");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
