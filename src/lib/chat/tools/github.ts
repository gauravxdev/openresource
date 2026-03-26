/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { tool } from "ai";
import { z } from "zod";
import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [/github\.com\/([^/]+)\/([^/?#]+)(?:\.git)?/];
  for (const pattern of patterns) {
    const match = pattern.exec(url);
    if (match?.[1] && match[2]) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Platform Detection from GitHub Data
// ─────────────────────────────────────────────────────────────────────────────

const PLATFORM_KEYWORDS: Record<string, string[]> = {
  android: [
    "android",
    "android-app",
    "apk",
    "play store",
    "google play",
    "kotlin",
  ],
  ios: ["ios", "iphone", "ipad", "app store", "ipa", "swift", "xcode"],
  windows: ["windows", "win32", "win64", "uwp", "wpf", "winforms"],
  macos: ["macos", "mac os", "osx", "apple silicon", "cocoa", "appkit"],
  linux: [
    "linux",
    "ubuntu",
    "debian",
    "fedora",
    "flatpak",
    "snap",
    "appimage",
    "gnome",
    "kde",
  ],
  web: ["web", "browser", "pwa", "react", "vue", "angular", "nextjs", "nuxt"],
};

const ASSET_EXTENSIONS: Record<string, string[]> = {
  android: [".apk", ".aab"],
  windows: [".exe", ".msi", ".zip"],
  macos: [".dmg", ".pkg", ".app.zip"],
  linux: [".deb", ".rpm", ".appimage", ".flatpak", ".snap", ".tar.gz"],
  ios: [".ipa"],
};

const DIR_PLATFORMS: Record<string, string> = {
  android: "android",
  ios: "ios",
  linux: "linux",
  windows: "windows",
  macos: "macos",
  mac: "macos",
  darwin: "macos",
};

const LANG_PLATFORMS: Record<string, string> = {
  Kotlin: "android",
  Swift: "ios",
  "Objective-C": "ios",
  "C#": "windows",
};

interface PlatformEvidence {
  platform: string;
  source: string;
  detail: string;
}

function detectPlatformsFromText(
  text: string,
  source: string,
): PlatformEvidence[] {
  const lower = text.toLowerCase();
  const evidence: PlatformEvidence[] = [];

  for (const [platform, keywords] of Object.entries(PLATFORM_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        evidence.push({
          platform,
          source,
          detail: `Found "${kw}" in ${source}`,
        });
        break;
      }
    }
  }

  return evidence;
}

function detectPlatformsFromTopics(topics: string[]): PlatformEvidence[] {
  const evidence: PlatformEvidence[] = [];

  for (const topic of topics) {
    const lower = topic.toLowerCase();
    for (const [platform, keywords] of Object.entries(PLATFORM_KEYWORDS)) {
      if (keywords.includes(lower)) {
        evidence.push({
          platform,
          source: "topics",
          detail: `Topic: "${topic}"`,
        });
      }
    }
  }

  return evidence;
}

function detectPlatformsFromAssets(
  assets: Array<{ name: string }>,
): PlatformEvidence[] {
  const evidence: PlatformEvidence[] = [];

  for (const asset of assets) {
    const lowerName = asset.name.toLowerCase();
    for (const [platform, extensions] of Object.entries(ASSET_EXTENSIONS)) {
      for (const ext of extensions) {
        if (lowerName.endsWith(ext)) {
          evidence.push({
            platform,
            source: "release",
            detail: `Release asset: ${asset.name}`,
          });
          break;
        }
      }
    }
  }

  return evidence;
}

function detectPlatformsFromDirs(dirs: string[]): PlatformEvidence[] {
  const evidence: PlatformEvidence[] = [];

  for (const dir of dirs) {
    const lower = dir.toLowerCase();
    const platform = DIR_PLATFORMS[lower];
    if (platform) {
      evidence.push({
        platform,
        source: "directory",
        detail: `Found /${dir} folder`,
      });
    }
  }

  return evidence;
}

function detectPlatformsFromLanguages(
  languages: Record<string, number>,
): PlatformEvidence[] {
  const evidence: PlatformEvidence[] = [];

  for (const lang of Object.keys(languages)) {
    const platform = LANG_PLATFORMS[lang];
    if (platform) {
      evidence.push({
        platform,
        source: "language",
        detail: `Primary language: ${lang}`,
      });
    }
  }

  return evidence;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool Definition
// ─────────────────────────────────────────────────────────────────────────────

export const getGitHubRepoDeepDive = tool({
  description:
    "Deep dive into a GitHub repository: live stats, README content, programming languages, release count, recent commits, open issues, AND platform support detection. Use this when: the user wants detailed info about a resource's GitHub repo, asks about features in README, wants to check if a project is actively maintained, OR needs to verify platform support (android, ios, windows, linux, macos). The detectedPlatforms field shows which platforms the project supports based on README, topics, releases, directory structure, and languages.",
  parameters: z.object({
    repositoryUrl: z
      .string()
      .min(1)
      .describe(
        "The full GitHub repository URL (e.g. 'https://github.com/owner/repo').",
      ),
  }),
  execute: async (args: { repositoryUrl: string }) => {
    try {
      const parsed = parseGitHubUrl(args.repositoryUrl);
      if (!parsed) {
        return {
          error:
            "Invalid GitHub URL. Please provide a full GitHub repository URL.",
        };
      }

      const { owner, repo } = parsed;

      const [repoData, languagesData, commitsData] = await Promise.all([
        octokit.request("GET /repos/{owner}/{repo}", { owner, repo }),
        octokit
          .request("GET /repos/{owner}/{repo}/languages", { owner, repo })
          .catch(() => ({ data: {} })),
        octokit
          .request("GET /repos/{owner}/{repo}/commits", {
            owner,
            repo,
            per_page: 5,
          })
          .catch(() => ({ data: [] })),
      ]);

      // Fetch README
      let readme = "";
      try {
        const readmeResponse = await octokit.request(
          "GET /repos/{owner}/{repo}/readme",
          { owner, repo },
        );
        if (
          typeof readmeResponse.data === "object" &&
          readmeResponse.data !== null &&
          "content" in readmeResponse.data &&
          typeof (readmeResponse.data as { content: string }).content ===
            "string"
        ) {
          const fullReadme = Buffer.from(
            (readmeResponse.data as { content: string }).content,
            "base64",
          ).toString("utf-8");
          readme =
            fullReadme.length > 3000
              ? fullReadme.slice(0, 3000) + "\n\n... (truncated)"
              : fullReadme;
        }
      } catch {
        readme = "README not available.";
      }

      // Fetch recent releases for platform detection
      let releaseAssets: Array<{ name: string }> = [];
      try {
        const releasesResponse = await octokit.request(
          "GET /repos/{owner}/{repo}/releases",
          { owner, repo, per_page: 3 },
        );
        for (const release of releasesResponse.data) {
          for (const asset of release.assets ?? []) {
            releaseAssets.push({ name: asset.name });
          }
        }
      } catch {
        // No releases or error
      }

      // Fetch directory structure for platform detection
      let dirNames: string[] = [];
      try {
        const contentsResponse = await octokit.request(
          "GET /repos/{owner}/{repo}/contents",
          { owner, repo },
        );
        if (Array.isArray(contentsResponse.data)) {
          dirNames = contentsResponse.data
            .filter((item: any) => item.type === "dir")
            .map((item: any) => item.name as string);
        }
      } catch {
        // Error fetching contents
      }

      const data = repoData.data;
      const languages = languagesData.data as Record<string, number>;
      const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
      const languageBreakdown = Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([lang, bytes]) => ({
          language: lang,
          percentage:
            totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
        }));

      const recentCommits = (
        commitsData.data as Array<{
          commit: { message: string; author: { date: string | null } };
          sha: string;
        }>
      ).map((c) => ({
        message: c.commit.message.split("\n")[0]?.slice(0, 100) ?? "",
        date: c.commit.author?.date?.split("T")[0] ?? null,
        sha: c.sha.slice(0, 7),
      }));

      const now = new Date();
      const daysSinceUpdate = data.pushed_at
        ? Math.floor(
            (now.getTime() - new Date(data.pushed_at).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null;

      // ─── Platform Detection ────────────────────────────────────────────
      const allEvidence: PlatformEvidence[] = [
        ...detectPlatformsFromText(readme, "readme"),
        ...detectPlatformsFromText(data.description ?? "", "description"),
        ...detectPlatformsFromTopics(data.topics ?? []),
        ...detectPlatformsFromAssets(releaseAssets),
        ...detectPlatformsFromDirs(dirNames),
        ...detectPlatformsFromLanguages(languages),
      ];

      // Deduplicate evidence
      const seen = new Set<string>();
      const uniqueEvidence = allEvidence.filter((e) => {
        const key = `${e.platform}-${e.source}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const detectedPlatforms = [
        ...new Set(uniqueEvidence.map((e) => e.platform)),
      ];

      return {
        name: data.full_name,
        description: data.description,
        url: data.html_url,
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        watchers: data.watchers_count,
        license: data.license?.spdx_id ?? null,
        createdAt: data.created_at?.split("T")[0],
        updatedAt: data.updated_at?.split("T")[0],
        pushedAt: data.pushed_at?.split("T")[0],
        daysSinceLastPush: daysSinceUpdate,
        isArchived: data.archived,
        isFork: data.fork,
        defaultBranch: data.default_branch,
        topics: data.topics ?? [],
        languageBreakdown,
        recentCommits,
        readme,
        activityStatus:
          daysSinceUpdate === null
            ? "unknown"
            : daysSinceUpdate <= 7
              ? "very active"
              : daysSinceUpdate <= 30
                ? "active"
                : daysSinceUpdate <= 180
                  ? "low activity"
                  : "likely inactive",
        detectedPlatforms,
        platformEvidence: uniqueEvidence,
      };
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 404) {
        return {
          error:
            "Repository not found. The URL may be incorrect or the repo may be private.",
        };
      }
      if (err.status === 403) {
        return {
          error: "GitHub API rate limit exceeded. Please try again later.",
        };
      }
      console.error("[Chat Tool] getGitHubRepoDeepDive error:", error);
      return { error: "Failed to fetch GitHub repository data." };
    }
  },
} as any);
