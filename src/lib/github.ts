import { Octokit } from "octokit";
import dotenv from "dotenv";
import { githubCache, createCacheKey } from "./cache";

dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const CONTRIBUTOR_CACHE_TTL = 60 * 60 * 1000;

export interface RepoDetails {
  name: string;
  description: string | null;
  html_url: string;
  topics?: string[];
  created_at: string | null;
  updated_at: string | null;
  license: { name?: string; spdx_id?: string } | null;
  open_issues_count: number;
  forks_count: number;
  stargazers_count: number;
}

export async function getRepoDetails(
  owner: string,
  repo: string,
): Promise<RepoDetails | undefined> {
  try {
    const { data } = await octokit.request("GET /repos/{owner}/{repo}", {
      owner,
      repo,
    });

    const {
      name,
      description,
      html_url,
      topics,
      created_at,
      updated_at,
      license,
      open_issues_count,
      forks_count,
      stargazers_count,
    } = data;

    return {
      name,
      description,
      html_url,
      topics,
      created_at: created_at ?? null,
      updated_at: updated_at ?? null,
      license: license
        ? {
            name: license.name ?? undefined,
            spdx_id: license.spdx_id ?? undefined,
          }
        : null,
      open_issues_count,
      forks_count,
      stargazers_count,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getReadmeFile(
  owner: string,
  repo: string,
): Promise<string | undefined> {
  try {
    const { data } = await octokit.request("GET /repos/{owner}/{repo}/readme", {
      owner,
      repo,
    });

    // Decode Base64 to UTF-8
    if (
      typeof data === "object" &&
      data !== null &&
      "content" in data &&
      typeof (data as { content: string }).content === "string"
    ) {
      return Buffer.from(
        (data as { content: string }).content,
        "base64",
      ).toString("utf-8");
    }
    return undefined;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Represents a file or directory entry in the repo root.
 */
export interface RepoFileEntry {
  name: string;
  type: "file" | "dir";
}

/**
 * Fetches the root-level file/directory structure of a repository.
 * Used for classification signals (e.g., detecting Dockerfile, packages/, etc.)
 *
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Array of file entries or undefined on error
 */
export async function getRepoStructure(
  owner: string,
  repo: string,
): Promise<RepoFileEntry[] | undefined> {
  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/contents",
      {
        owner,
        repo,
      },
    );
    const data = response.data as unknown;

    // GitHub returns an array for directory contents (explicitly cast to safely map)
    if (Array.isArray(data)) {
      return (data as unknown[]).map((item) => {
        const typedItem = item as { name: string; type: string };
        return {
          name: typedItem.name,
          type: typedItem.type === "dir" ? ("dir" as const) : ("file" as const),
        };
      });
    }
    return undefined;
  } catch (error) {
    console.error("Failed to fetch repo structure:", error);
    return undefined;
  }
}

/**
 * Fetches the languages used in the repository.
 * Returns a map of language names to bytes of code.
 */
export async function getLanguages(
  owner: string,
  repo: string,
): Promise<Record<string, number>> {
  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/languages",
      {
        owner,
        repo,
      },
    );
    return data;
  } catch (error) {
    console.error("Failed to fetch languages:", error);
    return {};
  }
}

/**
 * Fetches the number of releases for the repository.
 * Returns the total count of releases.
 */
export async function getReleaseCount(
  owner: string,
  repo: string,
): Promise<number> {
  try {
    // Fetch just one item to get the headers/stats
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/releases",
      {
        owner,
        repo,
        per_page: 1,
      },
    );

    // If there's a Link header, parse it to find the last page number
    const linkHeader = response.headers.link;
    if (linkHeader) {
      const regex = /page=(\d+)>; rel="last"/;
      const match = regex.exec(linkHeader);
      if (match?.[1]) {
        return parseInt(match[1], 10);
      }
    }

    // If no Link header, the count is just the length of the data on the first page
    if (Array.isArray(response.data)) {
      return response.data.length;
    }

    return 0;
  } catch {
    // 404 means no releases usually, or just return 0 on error to be safe
    return 0;
  }
}

export interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

/**
 * Fetches contributors for a repository.
 * Returns top contributors sorted by contribution count.
 * Results are cached for 1 hour to reduce GitHub API calls.
 */
export async function getContributors(
  owner: string,
  repo: string,
  limit = 10,
): Promise<Contributor[]> {
  const cacheKey = createCacheKey(owner, repo, `contributors:${limit}`);
  const cached = githubCache.get<Contributor[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/contributors",
      {
        owner,
        repo,
        per_page: limit,
      },
    );

    const contributors = data
      .filter(
        (
          c,
        ): c is typeof c & {
          login: string;
          avatar_url: string;
          html_url: string;
        } =>
          typeof c.login === "string" &&
          typeof c.avatar_url === "string" &&
          typeof c.html_url === "string",
      )
      .map((contributor) => ({
        login: contributor.login,
        avatar_url: contributor.avatar_url,
        html_url: contributor.html_url,
        contributions: contributor.contributions,
      }));

    githubCache.set(cacheKey, contributors, CONTRIBUTOR_CACHE_TTL);
    return contributors;
  } catch {
    return [];
  }
}

/**
 * Extracts owner and repo from a GitHub URL.
 */
export function parseGitHubUrl(
  url: string,
): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("github.com")) return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2 || !parts[0] || !parts[1]) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
  } catch {
    return null;
  }
}
