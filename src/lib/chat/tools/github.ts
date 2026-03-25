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

export const getGitHubRepoDeepDive = tool({
  description:
    "Deep dive into a GitHub repository: live stats, README content, programming languages, release count, recent commits, and open issues. Use this when the user wants detailed info about a specific resource's GitHub repo, asks about features mentioned in README, wants to check if a project is actively maintained, or asks technical questions about a repo.",
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
