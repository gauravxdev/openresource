"use server";

import { db } from "@/server/db";
import type { ResourceWithCategories } from "@/actions/resources";

interface SimilarResourceCandidate {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string | null;
  oneLiner: string | null;
  websiteUrl: string | null;
  repositoryUrl: string;
  alternative: string | null;
  stars: number;
  forks: number;
  lastCommit: Date | null;
  repositoryCreatedAt: Date | null;
  image: string | null;
  logo: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  addedBy: string | null;
  license: string | null;
  tags: string[];
  builtWith: unknown;
  categories: { name: string; slug: string }[];
}

function scoreResource(
  candidate: SimilarResourceCandidate,
  currentCategorySlugs: string[],
  currentTags: string[],
  currentBuiltWith: { name: string; slug: string }[] | null,
  currentLicense: string | null,
  maxStars: number,
): number {
  let score = 0;

  // Category overlap (weight 3)
  const candidateCategorySlugs = candidate.categories.map((c) => c.slug);
  const sharedCategories = candidateCategorySlugs.filter((slug) =>
    currentCategorySlugs.includes(slug),
  ).length;
  score += sharedCategories * 3;

  // Tag overlap (weight 2)
  if (currentTags.length > 0 && candidate.tags.length > 0) {
    const currentTagSet = new Set(
      currentTags.map((t) => t.toLowerCase().trim()),
    );
    const sharedTags = candidate.tags.filter((t) =>
      currentTagSet.has(t.toLowerCase().trim()),
    ).length;
    score += sharedTags * 2;
  }

  // BuiltWith overlap (weight 1)
  if (currentBuiltWith && currentBuiltWith.length > 0) {
    const candidateBuiltWith =
      (candidate.builtWith as { name: string; slug: string }[] | null) ?? null;
    if (candidateBuiltWith && candidateBuiltWith.length > 0) {
      const currentSlugs = new Set(currentBuiltWith.map((b) => b.slug));
      const sharedBuiltWith = candidateBuiltWith.filter((b) =>
        currentSlugs.has(b.slug),
      ).length;
      score += sharedBuiltWith * 1;
    }
  }

  // License match (weight 0.5)
  if (
    currentLicense &&
    candidate.license &&
    currentLicense.toLowerCase() === candidate.license.toLowerCase()
  ) {
    score += 0.5;
  }

  // Popularity bonus (0 to 0.5 based on stars)
  if (maxStars > 0) {
    score += (candidate.stars / maxStars) * 0.5;
  }

  return score;
}

export async function getSimilarResources(
  currentSlug: string,
  limit = 6,
): Promise<{ success: boolean; data: ResourceWithCategories[] }> {
  try {
    // 1. Fetch current resource with categories and tags
    const current = await db.resource.findUnique({
      where: { slug: currentSlug },
      select: {
        id: true,
        categories: { select: { name: true, slug: true } },
        tags: true,
        builtWith: true,
        license: true,
      },
    });

    if (!current) {
      return { success: false, data: [] };
    }

    const currentCategorySlugs = current.categories.map((c) => c.slug);
    const currentTags = current.tags ?? [];
    const currentBuiltWith =
      (current.builtWith as { name: string; slug: string }[] | null) ?? null;

    // If resource has no categories and no tags, fall back to popular resources
    if (currentCategorySlugs.length === 0 && currentTags.length === 0) {
      const fallback = await db.resource.findMany({
        where: {
          status: "APPROVED",
          slug: { not: currentSlug },
        },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          shortDescription: true,
          oneLiner: true,
          websiteUrl: true,
          repositoryUrl: true,
          alternative: true,
          stars: true,
          forks: true,
          lastCommit: true,
          repositoryCreatedAt: true,
          image: true,
          logo: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          addedBy: true,
          license: true,
          tags: true,
          builtWith: true,
          categories: { select: { name: true, slug: true } },
        },
        orderBy: { stars: "desc" },
        take: limit,
      });

      return {
        success: true,
        data: fallback.map((r) => ({
          ...r,
          shortDescription: r.shortDescription,
          oneLiner: r.oneLiner,
          tags: r.tags ?? [],
        })),
      };
    }

    // 2. Build OR conditions for fetching candidates
    const orConditions: Record<string, unknown>[] = [];

    if (currentCategorySlugs.length > 0) {
      orConditions.push({
        categories: { some: { slug: { in: currentCategorySlugs } } },
      });
    }

    if (currentTags.length > 0) {
      orConditions.push({
        tags: { hasSome: currentTags },
      });
    }

    // 3. Fetch candidate resources
    const candidates = await db.resource.findMany({
      where: {
        status: "APPROVED",
        slug: { not: currentSlug },
        OR: orConditions,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        shortDescription: true,
        oneLiner: true,
        websiteUrl: true,
        repositoryUrl: true,
        alternative: true,
        stars: true,
        forks: true,
        lastCommit: true,
        repositoryCreatedAt: true,
        image: true,
        logo: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        addedBy: true,
        license: true,
        tags: true,
        builtWith: true,
        categories: { select: { name: true, slug: true } },
      },
      orderBy: { stars: "desc" },
      take: 200,
    });

    if (candidates.length === 0) {
      return { success: true, data: [] };
    }

    // 4. Score candidates
    const maxStars = Math.max(...candidates.map((c) => c.stars), 1);

    const scored = candidates.map((candidate) => ({
      resource: candidate,
      score: scoreResource(
        candidate,
        currentCategorySlugs,
        currentTags,
        currentBuiltWith,
        current.license,
        maxStars,
      ),
    }));

    // 5. Sort by score desc, then by stars desc as tiebreaker
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.resource.stars - a.resource.stars;
    });

    // 6. Apply minimum score threshold, then fallback
    const MIN_SCORE = 2;
    let filtered = scored.filter((s) => s.score >= MIN_SCORE);

    if (filtered.length < limit) {
      // Relax threshold to 1
      const relaxed = scored.filter(
        (s) => s.score >= 1 && !filtered.includes(s),
      );
      filtered = [...filtered, ...relaxed];
    }

    if (filtered.length < limit) {
      // Fill remaining with top-starred in same categories
      const alreadyIncluded = new Set(filtered.map((s) => s.resource.id));
      const remaining = await db.resource.findMany({
        where: {
          status: "APPROVED",
          slug: { not: currentSlug },
          id: { notIn: Array.from(alreadyIncluded) },
          ...(currentCategorySlugs.length > 0
            ? { categories: { some: { slug: { in: currentCategorySlugs } } } }
            : {}),
        },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          shortDescription: true,
          oneLiner: true,
          websiteUrl: true,
          repositoryUrl: true,
          alternative: true,
          stars: true,
          forks: true,
          lastCommit: true,
          repositoryCreatedAt: true,
          image: true,
          logo: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          addedBy: true,
          license: true,
          tags: true,
          builtWith: true,
          categories: { select: { name: true, slug: true } },
        },
        orderBy: { stars: "desc" },
        take: limit - filtered.length,
      });

      for (const r of remaining) {
        filtered.push({
          resource: r,
          score: 0,
        });
      }
    }

    // 7. Return top results
    const results: ResourceWithCategories[] = filtered
      .slice(0, limit)
      .map(({ resource: r }) => ({
        ...r,
        shortDescription: r.shortDescription,
        oneLiner: r.oneLiner,
        tags: r.tags ?? [],
      }));

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching similar resources:", error);
    return { success: false, data: [] };
  }
}
