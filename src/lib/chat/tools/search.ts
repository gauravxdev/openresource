/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { tool } from "ai";
import { z } from "zod";
import { db } from "@/server/db";
import { Prisma } from "@prisma/client";

const searchResourcesParams = z.object({
  query: z
    .string()
    .optional()
    .describe(
      "Search text to match against resource name, description, and tags. Use 1-3 key concepts for best results (e.g. 'terminal ide' instead of 'ide which i can run on command line').",
    ),
  category: z
    .string()
    .optional()
    .describe(
      "Filter by category name or slug (e.g. 'developer-tools', 'ai-models').",
    ),
  tag: z
    .string()
    .optional()
    .describe("Filter by tag (e.g. 'music', 'offline', 'privacy')."),
  sortBy: z
    .enum(["stars", "forks", "latest", "oldest", "last-commit", "name"])
    .default("stars")
    .describe("Sort order for results."),
  limit: z
    .number()
    .min(1)
    .max(15)
    .default(10)
    .describe("Maximum number of results to return (1-15)."),
});

// ─────────────────────────────────────────────────────────────────────────────
// Platform Detection
// ─────────────────────────────────────────────────────────────────────────────

const PLATFORM_KEYWORDS: Record<string, string[]> = {
  android: [
    "android",
    "android-app",
    "android-apps",
    "apk",
    "play store",
    "google play",
  ],
  ios: ["ios", "iphone", "ipad", "apple", "app store", "ipa"],
  windows: ["windows", "windows-app", "windows-apps", "win", "exe", "msi"],
  macos: ["macos", "mac", "osx", "dmg", "mac os", "apple silicon"],
  linux: [
    "linux",
    "ubuntu",
    "debian",
    "fedora",
    "rpm",
    "deb",
    "flatpak",
    "snap",
    "appimage",
  ],
  web: ["web", "browser", "pwa", "website", "online", "saas"],
  crossplatform: [
    "cross-platform",
    "cross platform",
    "multi-platform",
    "multiplatform",
  ],
};

const CATEGORY_TO_PLATFORM: Record<string, string[]> = {
  "android-app": ["android"],
  "android-apps": ["android"],
  "windows-app": ["windows"],
  "windows-apps": ["windows"],
  "github-repo": ["web"],
  "github-repos": ["web"],
};

function inferPlatforms(
  categories: { name: string; slug: string }[],
  tags: string[],
  text: string,
): string[] {
  const platforms = new Set<string>();
  const lowerText = text.toLowerCase();
  for (const cat of categories) {
    const mapped = CATEGORY_TO_PLATFORM[cat.slug.toLowerCase()];
    if (mapped) mapped.forEach((p) => platforms.add(p));
  }
  for (const tag of tags.map((t) => t.toLowerCase())) {
    for (const [platform, keywords] of Object.entries(PLATFORM_KEYWORDS)) {
      if (keywords.includes(tag)) {
        platforms.add(
          platform === "crossplatform" ? "cross-platform" : platform,
        );
      }
    }
  }
  for (const [platform, keywords] of Object.entries(PLATFORM_KEYWORDS)) {
    for (const kw of keywords) {
      if (lowerText.includes(kw)) {
        platforms.add(
          platform === "crossplatform" ? "cross-platform" : platform,
        );
        break;
      }
    }
  }
  return Array.from(platforms);
}

function detectQueryPlatforms(query: string): string[] {
  const lower = query.toLowerCase();
  const detected = new Set<string>();
  for (const [platform, keywords] of Object.entries(PLATFORM_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        detected.add(
          platform === "crossplatform" ? "cross-platform" : platform,
        );
        break;
      }
    }
  }
  return Array.from(detected);
}

// ─────────────────────────────────────────────────────────────────────────────
// Keyword Expansion / Synonyms
// ─────────────────────────────────────────────────────────────────────────────

const KEYWORD_SYNONYMS: Record<string, string[]> = {
  cli: ["cli", "command-line", "terminal", "console", "tui"],
  command: ["cli", "command-line", "terminal", "console"],
  "command-line": ["cli", "command", "terminal", "console"],
  terminal: ["cli", "command-line", "terminal", "console", "tui"],
  console: ["cli", "command-line", "terminal", "console"],
  ide: ["ide", "editor", "code-editor", "development"],
  editor: ["ide", "editor", "code-editor"],
  "code-editor": ["ide", "editor", "code-editor"],
  notes: ["notes", "note-taking", "notepad", "knowledge"],
  "note-taking": ["notes", "notepad", "markdown", "knowledge"],
  chat: ["chat", "messaging", "instant-messaging", "message"],
  messaging: ["chat", "messaging", "instant-messaging"],
  video: ["video", "video-editor", "multimedia"],
  "video-editor": ["video", "video-editing", "multimedia"],
  audio: ["audio", "music", "media-player", "sound"],
  music: ["audio", "music", "media-player"],
  image: ["image", "photo", "image-editor", "graphics"],
  photo: ["image", "photo", "image-editor", "graphics"],
  translate: ["translate", "translation", "translator"],
  translation: ["translate", "translation", "translator"],
  offline: ["offline", "local", "self-hosted"],
  ios: ["ios", "iphone", "ipad", "apple", "mobile"],
  android: ["android", "apk", "mobile"],
  windows: ["windows", "win", "desktop"],
  macos: ["macos", "mac", "desktop", "apple"],
  linux: ["linux", "ubuntu", "debian", "fedora", "desktop"],
  app: ["app", "application", "software", "tool"],
  mobile: ["mobile", "ios", "android", "phone", "tablet"],
  desktop: ["desktop", "windows", "macos", "linux"],
  alternative: ["alternative", "replacement", "substitute"],
  replacement: ["alternative", "replacement", "substitute"],
};

const STOP_WORDS = new Set([
  "i",
  "me",
  "my",
  "we",
  "our",
  "you",
  "your",
  "he",
  "she",
  "it",
  "they",
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "can",
  "want",
  "need",
  "find",
  "look",
  "looking",
  "search",
  "searching",
  "which",
  "that",
  "this",
  "some",
  "any",
  "about",
  "there",
  "here",
  "use",
  "using",
  "run",
  "running",
  "something",
  "things",
  "good",
  "great",
  "help",
]);

// ─────────────────────────────────────────────────────────────────────────────
// "Alternative to X" Pattern Detection
// ─────────────────────────────────────────────────────────────────────────────

const ALTERNATIVE_PATTERNS: RegExp[] = [
  /alternative\s+(?:to|for)\s+(.+)/i,
  /(.+?)\s+alternative/i,
  /free\s+(?:version|alternative)\s+(?:of|for|to)\s+(.+)/i,
  /(?:free|open[- ]?source)\s+(.+)/i,
  /(?:like|similar\s+to)\s+(.+?)(?:\s+but\s+(?:free|open|better))?$/i,
  /replace(?:ment)?\s+(?:for|of|to)\s+(.+)/i,
  /instead\s+of\s+(.+)/i,
  /(.+?)\s+(?:replacement|substitute|clone|rival)/i,
];

/**
 * Extract the target product name from queries like:
 * - "alternative to Higgsfield"
 * - "free version of Figma"
 * - "something like Notion but free"
 * - "Higgsfield alternative"
 * Returns the cleaned product name or null if no pattern matches.
 */
function extractAlternativeTarget(query: string): string | null {
  const trimmed = query.trim();
  for (const pattern of ALTERNATIVE_PATTERNS) {
    const match = pattern.exec(trimmed);
    if (match?.[1]) {
      // Clean up the extracted product name
      const target = match[1]
        .trim()
        .replace(/[?.!,;:]+$/g, "") // strip trailing punctuation
        .replace(
          /^(?:a|an|the|any|some|open[- ]?source|free|best|good)\s+/gi,
          "",
        ) // strip leading articles/adjectives
        .trim();
      if (target.length >= 2) return target;
    }
  }
  return null;
}

function extractSearchTerms(query: string): string[] {
  const lower = query.toLowerCase();
  const phrases = new Set<string>();
  for (const [phrase] of Object.entries(KEYWORD_SYNONYMS)) {
    if (phrase.includes(" ") && lower.includes(phrase)) {
      phrases.add(phrase);
    }
  }
  const words = lower
    .split(/[\s,;:.!?]+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  const terms = new Set<string>();
  const MAX_EXPANSIONS_PER_WORD = 4;
  const MAX_TOTAL_TERMS = 16;

  for (const phrase of phrases) {
    terms.add(phrase);
    const syns = KEYWORD_SYNONYMS[phrase] ?? [];
    for (let i = 0; i < Math.min(syns.length, MAX_EXPANSIONS_PER_WORD); i++) {
      const syn = syns[i];
      if (syn) terms.add(syn);
      if (terms.size >= MAX_TOTAL_TERMS) break;
    }
    if (terms.size >= MAX_TOTAL_TERMS) break;
  }

  const phrasesArr = Array.from(phrases);
  for (const word of words) {
    if (terms.size >= MAX_TOTAL_TERMS) break;
    if (!phrasesArr.some((p) => p.includes(word))) {
      terms.add(word);
      const syns = KEYWORD_SYNONYMS[word] ?? [];
      for (let i = 0; i < Math.min(syns.length, MAX_EXPANSIONS_PER_WORD); i++) {
        const syn = syns[i];
        if (syn) terms.add(syn);
        if (terms.size >= MAX_TOTAL_TERMS) break;
      }
    }
  }

  return Array.from(terms);
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoring
// ─────────────────────────────────────────────────────────────────────────────

function scoreResource(
  resource: {
    name: string;
    description: string | null;
    shortDescription: string | null;
    oneLiner: string | null;
    alternative: string | null;
    tags: string[];
    categories: { name: string; slug: string }[];
  },
  searchTerms: string[],
  alternativeTarget?: string | null,
): number {
  const searchableTags = resource.tags.map((t) => t.toLowerCase());
  const searchableCategories = resource.categories
    .map((c) => c.name.toLowerCase())
    .join(" ");
  let score = 0;
  let matchedTerms = 0;

  // ── Alternative field match (highest priority) ──
  // If user is looking for an alternative to a specific product,
  // give massive bonus for matching the `alternative` field.
  if (alternativeTarget && resource.alternative) {
    const lowerAlt = resource.alternative.toLowerCase();
    const lowerTarget = alternativeTarget.toLowerCase();
    if (lowerAlt === lowerTarget) {
      // Exact match: "Higgsfield" === "Higgsfield"
      score += 50;
    } else if (
      lowerAlt.includes(lowerTarget) ||
      lowerTarget.includes(lowerAlt)
    ) {
      // Partial match: "Higgsfield AI" contains "Higgsfield"
      score += 35;
    } else {
      // Check comma/slash-separated alternatives: "Figma, Canva"
      const altParts = lowerAlt.split(/[,/|;]+/).map((s) => s.trim());
      if (altParts.some((p) => p === lowerTarget || p.includes(lowerTarget))) {
        score += 40;
      }
    }
  }

  for (const term of searchTerms) {
    const lowerTerm = term.toLowerCase();
    let termMatched = false;

    // Name match (high value)
    if (resource.name.toLowerCase().includes(lowerTerm)) {
      score += 10;
      termMatched = true;
    }
    // Alternative field match for each search term
    if (resource.alternative?.toLowerCase().includes(lowerTerm)) {
      score += 15;
      termMatched = true;
    }
    if (
      searchableTags.some(
        (t) =>
          t === lowerTerm || t.includes(lowerTerm) || lowerTerm.includes(t),
      )
    ) {
      score += 8;
      termMatched = true;
    }
    if (searchableCategories.includes(lowerTerm)) {
      score += 5;
      termMatched = true;
    }
    if (resource.oneLiner?.toLowerCase().includes(lowerTerm)) {
      score += 4;
      termMatched = true;
    }
    if (resource.shortDescription?.toLowerCase().includes(lowerTerm)) {
      score += 3;
      termMatched = true;
    }
    if (resource.description?.toLowerCase().includes(lowerTerm)) {
      score += 2;
      termMatched = true;
    }

    if (termMatched) matchedTerms++;
  }

  // Bonus for matching multiple terms
  if (matchedTerms >= 2) score += matchedTerms * 5;
  if (matchedTerms >= 3) score += matchedTerms * 10;

  // Bonus for platform keywords in descriptions
  const platformKeywords = [
    "ios",
    "android",
    "windows",
    "macos",
    "linux",
    "mobile",
    "desktop",
  ];
  const descriptionText = [
    resource.description ?? "",
    resource.shortDescription ?? "",
    resource.oneLiner ?? "",
  ]
    .join(" ")
    .toLowerCase();

  for (const keyword of platformKeywords) {
    if (descriptionText.includes(keyword)) {
      score += 3;
    }
  }

  return score;
}

// ─────────────────────────────────────────────────────────────────────────────
// Types & Formatting
// ─────────────────────────────────────────────────────────────────────────────

type ResourceResult = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  oneLiner: string | null;
  websiteUrl: string | null;
  repositoryUrl: string;
  alternative: string | null;
  stars: number;
  forks: number;
  lastCommit: Date | null;
  license: string | null;
  tags: string[];
  logo: string | null;
  categories: { name: string; slug: string }[];
};

function formatResource(r: ResourceResult, score: number) {
  const supportedPlatforms = inferPlatforms(
    r.categories,
    r.tags,
    `${r.shortDescription ?? ""} ${r.oneLiner ?? ""} ${r.alternative ?? ""}`,
  );
  return {
    name: r.name,
    slug: r.slug,
    description: r.shortDescription ?? r.oneLiner ?? "",
    url: r.websiteUrl ?? r.repositoryUrl,
    repositoryUrl: r.repositoryUrl,
    alternative: r.alternative,
    stars: r.stars,
    forks: r.forks,
    lastCommit: r.lastCommit?.toISOString().split("T")[0] ?? null,
    license: r.license,
    tags: r.tags,
    categories: r.categories.map((c) => c.name),
    supportedPlatforms,
    detailPage: `/resource/${r.slug}`,
    relevanceScore: score,
  };
}

const SELECT_FIELDS = {
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
  license: true,
  tags: true,
  logo: true,
  categories: { select: { name: true, slug: true } },
} as const;

function buildFieldOR(word: string): Prisma.ResourceWhereInput[] {
  // Build case variants for tag matching (tags use hasSome which is case-sensitive)
  const tagVariants = [
    word,
    word.toLowerCase(),
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  ];
  const uniqueTagVariants = [...new Set(tagVariants)];

  return [
    { name: { contains: word, mode: Prisma.QueryMode.insensitive } },
    { description: { contains: word, mode: Prisma.QueryMode.insensitive } },
    {
      shortDescription: { contains: word, mode: Prisma.QueryMode.insensitive },
    },
    { oneLiner: { contains: word, mode: Prisma.QueryMode.insensitive } },
    { alternative: { contains: word, mode: Prisma.QueryMode.insensitive } },
    { tags: { hasSome: uniqueTagVariants } },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool Definition
// ─────────────────────────────────────────────────────────────────────────────

export const searchResources = tool({
  description:
    "Search the OpenResource database for free and open-source tools, apps, and resources. Use this FIRST when a user is looking for a tool, app, or resource. Supports 'alternative to X' queries — if user asks for a free version, alternative, or replacement for a proprietary tool, just pass the product name as the query (e.g. query='higgsfield' if user says 'free version of higgsfield'). Uses intelligent keyword expansion. Returns results sorted by relevance score. When user asks for a specific platform, check the supportedPlatforms field.",
  parameters: searchResourcesParams,
  execute: async (args: z.infer<typeof searchResourcesParams>) => {
    try {
      const { query, category, tag, sortBy } = args;
      const limit = Math.max(1, Math.min(15, args.limit ?? 10));
      const searchTerms = query?.trim() ? extractSearchTerms(query) : [];
      const queryPlatforms = detectQueryPlatforms(query ?? "");
      const alternativeTarget = query?.trim()
        ? extractAlternativeTarget(query)
        : null;

      const originalWords = query?.trim()
        ? query
            .trim()
            .toLowerCase()
            .split(/[\s,;:.!?]+/)
            .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
        : [];

      // Build sort order
      let orderBy: Prisma.ResourceOrderByWithRelationInput = { stars: "desc" };
      switch (sortBy) {
        case "forks":
          orderBy = { forks: "desc" };
          break;
        case "latest":
          orderBy = { createdAt: "desc" };
          break;
        case "oldest":
          orderBy = { createdAt: "asc" };
          break;
        case "last-commit":
          orderBy = { lastCommit: "desc" };
          break;
        case "name":
          orderBy = { name: "asc" };
          break;
      }

      // ── Query Level 0: Direct alternative field search (highest priority) ──
      // If user is looking for "alternative to X" or "free version of X",
      // search the alternative field directly first.
      let rawResources: any[] = [];

      if (alternativeTarget) {
        rawResources = await db.resource.findMany({
          where: {
            status: "APPROVED",
            alternative: {
              contains: alternativeTarget,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          select: SELECT_FIELDS,
          orderBy,
          take: Math.max(limit * 3, 30),
        });
      }

      // ── Query Level 1: AND across original words (strictest) ──
      if (rawResources.length === 0) {
        const conditions: Prisma.ResourceWhereInput[] = [
          { status: "APPROVED" },
        ];

        if (originalWords.length > 0) {
          for (const word of originalWords) {
            conditions.push({ OR: buildFieldOR(word) });
          }
        }

        if (category?.trim()) {
          conditions.push({
            categories: {
              some: {
                OR: [
                  {
                    name: {
                      equals: category.trim(),
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                  {
                    slug: {
                      equals: category.trim(),
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                ],
              },
            },
          });
        }

        if (tag?.trim()) {
          conditions.push({ tags: { has: tag.trim().toLowerCase() } });
        }

        rawResources = await db.resource.findMany({
          where: { AND: conditions },
          select: SELECT_FIELDS,
          orderBy,
          take: Math.max(limit * 3, 30),
        });
      }

      let usedFallback = false;

      // ── Query Level 2: At least 2 of original words match (relaxed AND) ──
      if (rawResources.length === 0 && originalWords.length >= 2) {
        const pairConditions: Prisma.ResourceWhereInput[] = [];
        for (let i = 0; i < originalWords.length; i++) {
          for (let j = i + 1; j < originalWords.length; j++) {
            const wordI = originalWords[i]!;
            const wordJ = originalWords[j]!;
            pairConditions.push({
              AND: [{ OR: buildFieldOR(wordI) }, { OR: buildFieldOR(wordJ) }],
            });
          }
        }
        rawResources = await db.resource.findMany({
          where: { AND: [{ status: "APPROVED" }, { OR: pairConditions }] },
          select: SELECT_FIELDS,
          orderBy,
          take: Math.max(limit * 3, 30),
        });
        usedFallback = rawResources.length > 0;
      }

      // ── Query Level 3: OR across original words ──
      if (rawResources.length === 0 && originalWords.length > 0) {
        rawResources = await db.resource.findMany({
          where: {
            AND: [
              { status: "APPROVED" },
              { OR: originalWords.flatMap((w) => buildFieldOR(w)) },
            ],
          },
          select: SELECT_FIELDS,
          orderBy,
          take: Math.max(limit * 3, 30),
        });
        usedFallback = rawResources.length > 0;
      }

      // ── Query Level 4: OR across expanded terms (widest net) ──
      if (rawResources.length === 0 && searchTerms.length > 0) {
        rawResources = await db.resource.findMany({
          where: {
            AND: [
              { status: "APPROVED" },
              {
                OR: searchTerms.flatMap((term) =>
                  buildFieldOR(term.toLowerCase()),
                ),
              },
            ],
          },
          select: SELECT_FIELDS,
          orderBy,
          take: Math.max(limit * 3, 30),
        });
        usedFallback = rawResources.length > 0;
      }

      if (rawResources.length === 0) {
        return {
          found: 0,
          message:
            "No resources found matching your criteria. Try broadening your search or using different keywords.",
          resources: [],
        };
      }

      // ── Score, filter, and rank ──
      const termsForScoring =
        searchTerms.length > 0 ? searchTerms : originalWords;
      let scoredResources = rawResources.map((r: any) => ({
        ...r,
        score: scoreResource(r, termsForScoring, alternativeTarget),
      }));

      // Filter out resources with score 0 (completely irrelevant)
      scoredResources = scoredResources.filter((r) => r.score > 0);

      // Sort by score descending, stars as tiebreaker
      scoredResources.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.stars - a.stars;
      });

      // Take top results
      scoredResources = scoredResources.slice(0, limit);

      // If filtering removed all results, keep the raw results as fallback
      if (scoredResources.length === 0) {
        scoredResources = rawResources
          .slice(0, limit)
          .map((r) => ({ ...r, score: 0 }));
        usedFallback = true;
      }

      // ── Platform boost ──
      if (queryPlatforms.length > 0) {
        scoredResources.sort((a, b) => {
          const aP = inferPlatforms(
            a.categories,
            a.tags,
            `${a.shortDescription ?? ""} ${a.oneLiner ?? ""}`,
          );
          const bP = inferPlatforms(
            b.categories,
            b.tags,
            `${b.shortDescription ?? ""} ${b.oneLiner ?? ""}`,
          );
          const aM = aP.some((p) => queryPlatforms.includes(p));
          const bM = bP.some((p) => queryPlatforms.includes(p));
          if (aM && !bM) return -1;
          if (!aM && bM) return 1;
          return b.score - a.score;
        });
      }

      return {
        found: scoredResources.length,
        ...(usedFallback
          ? { note: "Showing closest results based on keyword relevance." }
          : {}),
        ...(queryPlatforms.length > 0
          ? { requestedPlatforms: queryPlatforms }
          : {}),
        ...(alternativeTarget
          ? { alternativeSearch: alternativeTarget }
          : {}),
        resources: scoredResources.map((r: any) => formatResource(r, r.score)),
      };
    } catch (error) {
      console.error("[Chat Tool] searchResources primary error:", error);

      // ── Fault tolerance: simple OR fallback ──
      const rawQuery = args.query;
      if (rawQuery?.trim()) {
        try {
          const simpleWords = rawQuery
            .trim()
            .toLowerCase()
            .split(/[\s,;:.!?]+/)
            .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
          if (simpleWords.length > 0) {
            const simpleResults = await db.resource.findMany({
              where: { OR: simpleWords.flatMap((w) => buildFieldOR(w)) },
              select: SELECT_FIELDS,
              orderBy: { stars: "desc" },
              take: 10,
            });
            if (simpleResults.length > 0) {
              return {
                found: simpleResults.length,
                note: "Search encountered an issue, showing basic keyword matches.",
                resources: simpleResults.map((r) => formatResource(r, 0)),
              };
            }
          }
        } catch (fallbackError) {
          console.error(
            "[Chat Tool] searchResources fallback also failed:",
            fallbackError,
          );
        }
      }

      return { error: "Failed to search resources. Please try again." };
    }
  },
} as any);
