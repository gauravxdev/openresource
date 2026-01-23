import { Octokit } from 'octokit';
import dotenv from "dotenv";

dotenv.config();

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

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

export async function getRepoDetails(owner: string, repo: string): Promise<RepoDetails | undefined> {
    try {
        const { data } = await octokit.request('GET /repos/{owner}/{repo}', {
            owner,
            repo,
        })

        const { name, description, html_url, topics, created_at, updated_at, license, open_issues_count, forks_count, stargazers_count } = data

        return {
            name,
            description,
            html_url,
            topics,
            created_at: created_at ?? null,
            updated_at: updated_at ?? null,
            license: license ? { name: license.name ?? undefined, spdx_id: license.spdx_id ?? undefined } : null,
            open_issues_count,
            forks_count,
            stargazers_count
        }

    } catch (error) {
        console.error(error)
        throw error
    }
}

export async function getReadmeFile(owner: string, repo: string): Promise<string | undefined> {
    try {
        const { data }: any = await octokit.request('GET /repos/{owner}/{repo}/readme', {
            owner,
            repo,
        })

        // Decode Base64 to UTF-8
        if (data.content) {
            return Buffer.from(data.content, "base64").toString("utf-8");
        }
        return undefined;
    } catch (error) {
        console.error(error)
        throw error
    }
}

/**
 * Represents a file or directory entry in the repo root.
 */
export interface RepoFileEntry {
    name: string;
    type: 'file' | 'dir';
}

/**
 * Fetches the root-level file/directory structure of a repository.
 * Used for classification signals (e.g., detecting Dockerfile, packages/, etc.)
 * 
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Array of file entries or undefined on error
 */
export async function getRepoStructure(owner: string, repo: string): Promise<RepoFileEntry[] | undefined> {
    try {
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents', {
            owner,
            repo,
        });

        // GitHub returns an array for directory contents
        if (Array.isArray(data)) {
            return data.map((item: { name: string; type: string }) => ({
                name: item.name,
                type: item.type === 'dir' ? 'dir' : 'file',
            }));
        }
        return undefined;
    } catch (error) {
        console.error('Failed to fetch repo structure:', error);
        return undefined;
    }
}

/**
 * Fetches the languages used in the repository.
 * Returns a map of language names to bytes of code.
 */
export async function getLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    try {
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/languages', {
            owner,
            repo,
        });
        return data;
    } catch (error) {
        console.error('Failed to fetch languages:', error);
        return {};
    }
}

/**
 * Fetches the number of releases for the repository.
 * Returns the total count of releases.
 */
export async function getReleaseCount(owner: string, repo: string): Promise<number> {
    try {
        // Fetch just one item to get the headers/stats
        const response: any = await octokit.request('GET /repos/{owner}/{repo}/releases', {
            owner,
            repo,
            per_page: 1,
        });

        // If there's a Link header, parse it to find the last page number
        const linkHeader = response.headers.link;
        if (linkHeader) {
            const match = linkHeader.match(/page=(\d+)>; rel="last"/);
            if (match) {
                return parseInt(match[1], 10);
            }
        }

        // If no Link header, the count is just the length of the data on the first page
        if (Array.isArray(response.data)) {
            return response.data.length;
        }

        return 0;
    } catch (error) {
        // 404 means no releases usually, or just return 0 on error to be safe
        return 0;
    }
}

