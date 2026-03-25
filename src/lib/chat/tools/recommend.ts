/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { tool } from "ai";
import { z } from "zod";
import { db } from "@/server/db";
import { generateText } from "ai";
import { getLanguageModel } from "@/lib/chat/providers";

export const recommendResources = tool({
  description:
    "Smart recommendation tool. Describe what you need in natural language and get the best matching resources. Uses AI to understand your use case and find the most relevant tools. Use this when the user describes a need rather than searching by name (e.g. 'I need a free video editor for Linux', 'something like Notion but open source', 'a privacy-focused browser').",
  parameters: z.object({
    useCase: z
      .string()
      .min(5)
      .describe(
        "Natural language description of what the user needs (e.g. 'free music streaming app for Android with offline download').",
      ),
    limit: z
      .number()
      .min(1)
      .max(10)
      .default(5)
      .describe("Number of recommendations to return (1-10)."),
  }),
  execute: async (args: { useCase: string; limit: number }) => {
    try {
      const candidates = await db.resource.findMany({
        where: { status: "APPROVED" },
        select: {
          slug: true,
          name: true,
          shortDescription: true,
          oneLiner: true,
          websiteUrl: true,
          repositoryUrl: true,
          stars: true,
          forks: true,
          license: true,
          tags: true,
          alternative: true,
          categories: { select: { name: true } },
        },
        orderBy: { stars: "desc" },
        take: 50,
      });

      if (candidates.length === 0) {
        return {
          recommendations: [],
          message: "No resources available to recommend.",
        };
      }

      const resourceList = candidates
        .map(
          (r, i) =>
            `${i + 1}. [${r.name}] (${r.slug}): ${r.shortDescription ?? r.oneLiner ?? "No description"} | Tags: ${r.tags.join(", ")} | Categories: ${r.categories.map((c) => c.name).join(", ")} | Stars: ${r.stars}${r.alternative ? ` | Alt to: ${r.alternative}` : ""}`,
        )
        .join("\n");

      const prompt = `You are a resource recommendation engine for OpenResource, an open-source tools directory.

User's need: "${args.useCase}"

Here are the top ${candidates.length} resources by popularity:
${resourceList}

Analyze the user's need and select the TOP ${args.limit} most relevant resources. Consider:
1. Does the resource's purpose match the user's need?
2. Do the tags and categories align?
3. Is it an alternative to what the user might be replacing?
4. Is it actively maintained (higher stars generally = more reliable)?

Return ONLY a JSON array of slugs in order of relevance (most relevant first):
["slug1", "slug2", "slug3"]

No explanation, no markdown, just the JSON array.`;

      const result = await generateText({
        model: getLanguageModel("mistral-small-latest"),
        prompt,
      });

      let recommendedSlugs: string[] = [];
      try {
        const text = result.text.trim();
        const jsonMatch = /\[[\s\S]*?\]/.exec(text);
        if (jsonMatch) {
          recommendedSlugs = JSON.parse(jsonMatch[0]) as string[];
        }
      } catch {
        return {
          error:
            "Failed to parse recommendations. Showing top resources by popularity instead.",
          recommendations: candidates.slice(0, args.limit).map((r) => ({
            name: r.name,
            slug: r.slug,
            description: r.shortDescription ?? r.oneLiner ?? "",
            url: r.websiteUrl ?? r.repositoryUrl,
            stars: r.stars,
            tags: r.tags,
            categories: r.categories.map((c) => c.name),
          })),
        };
      }

      const recommended = recommendedSlugs
        .map((slug) => candidates.find((c) => c.slug === slug))
        .filter(Boolean)
        .slice(0, args.limit);

      if (recommended.length === 0) {
        return {
          message:
            "Could not find matching resources. Showing top resources by popularity.",
          recommendations: candidates.slice(0, args.limit).map((r) => ({
            name: r.name,
            slug: r.slug,
            description: r.shortDescription ?? r.oneLiner ?? "",
            url: r.websiteUrl ?? r.repositoryUrl,
            stars: r.stars,
            tags: r.tags,
            categories: r.categories.map((c) => c.name),
          })),
        };
      }

      return {
        query: args.useCase,
        recommendations: recommended.map((r) => ({
          name: r!.name,
          slug: r!.slug,
          description: r!.shortDescription ?? r!.oneLiner ?? "",
          url: r!.websiteUrl ?? r!.repositoryUrl,
          stars: r!.stars,
          forks: r!.forks,
          license: r!.license,
          tags: r!.tags,
          categories: r!.categories.map((c) => c.name),
        })),
      };
    } catch (error) {
      console.error("[Chat Tool] recommendResources error:", error);
      return { error: "Failed to generate recommendations." };
    }
  },
} as any);
