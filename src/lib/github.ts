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
