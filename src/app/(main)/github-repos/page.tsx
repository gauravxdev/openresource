import React from "react";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "GitHub Repos - OpenResource",
  description:
    "Discover popular GitHub repositories and open-source projects. Browse a curated collection of developer tools, libraries, and applications.",
  alternates: {
    canonical: "https://openresource.site/github-repos",
  },
  openGraph: {
    title: "GitHub Repos - OpenResource",
    description:
      "Discover popular GitHub repositories and open-source projects. Browse a curated collection of developer tools, libraries, and applications.",
    url: "https://openresource.site/github-repos",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Repos - OpenResource",
    description:
      "Discover popular GitHub repositories and open-source projects. Browse a curated collection of developer tools, libraries, and applications.",
  },
};

export default async function GitHubRepos({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { page: pageStr, sort: sortParam } = await searchParams;
  const currentPage = Number(pageStr) || 1;
  const currentSort = sortParam ?? "latest";
  const { data: resources, totalCount } = await getGitHubRepos(
    currentPage,
    9,
    currentSort,
  );

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
      currentSort={currentSort}
    />
  );
}
