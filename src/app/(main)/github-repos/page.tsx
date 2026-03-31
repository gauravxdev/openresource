import React from "react";
import dynamic from "next/dynamic";
import { getGitHubRepos } from "@/actions/resources";

const GitHubReposClient = dynamic(() => import("./github-repos-client"));

export interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
  slug: string;
}

export const revalidate = 60;

export default async function GitHubRepos({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const currentPage = Number(pageStr) || 1;
  const { data: resources, totalCount } = await getGitHubRepos(currentPage, 9);

  const repos: GitHubRepo[] = resources.map((resource) => ({
    name: resource.name,
    description:
      resource.oneLiner ?? resource.shortDescription ?? resource.description,
    language: resource.categories[0]?.name ?? "Unknown",
    stars: resource.stars,
    forks: resource.forks,
    url: resource.repositoryUrl,
    slug: resource.slug,
  }));

  return (
    <GitHubReposClient
      initialRepos={repos}
      totalCount={totalCount || 0}
      currentPage={currentPage}
    />
  );
}
