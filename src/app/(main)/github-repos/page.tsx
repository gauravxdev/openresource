import React from "react"
import { getGitHubRepos } from "@/actions/resources"
import GitHubReposClient, { type GitHubRepo } from "./github-repos-client"

export const dynamic = "force-dynamic"

export default async function GitHubRepos() {
  const { data: resources } = await getGitHubRepos()

  const repos: GitHubRepo[] = resources.map((resource) => ({
    name: resource.name,
    description: resource.oneLiner ?? resource.shortDescription ?? resource.description,
    language: resource.categories[0]?.name ?? "Unknown",
    stars: resource.stars,
    forks: resource.forks,
    url: resource.repositoryUrl,
  }))

  return <GitHubReposClient initialRepos={repos} />
}
