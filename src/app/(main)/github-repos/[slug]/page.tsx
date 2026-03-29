import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { GitHubRepoDetailView } from "@/components/GitHubRepoDetailView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GitHubRepoDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const resource = await db.resource.findUnique({
    where: { slug },
    include: {
      categories: true,
      user: {
        select: {
          name: true,
          username: true,
          image: true,
        },
      },
    },
  });

  if (
    !resource ||
    !resource.categories.some(
      (c) => c.slug === "github-repo" || c.slug === "github-repos",
    )
  ) {
    notFound();
  }

  const repo = {
    id: resource.id,
    slug: resource.slug,
    name: resource.name,
    description: resource.description,
    shortDescription: resource.shortDescription,
    oneLiner: resource.oneLiner,
    language: resource.categories[0]?.name ?? "Unknown",
    stars: resource.stars,
    forks: resource.forks,
    lastCommit: resource.lastCommit,
    repositoryCreatedAt: resource.repositoryCreatedAt,
    license: resource.license,
    repositoryUrl: resource.repositoryUrl,
    logo: resource.logo,
    tags: resource.tags ?? [],
    user: resource.user,
  };

  return <GitHubRepoDetailView repo={repo} />;
}
