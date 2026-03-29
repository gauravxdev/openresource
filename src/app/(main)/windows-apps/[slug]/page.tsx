import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { AppDetailView, type AppDetailData } from "@/components/AppDetailView";
import { getContributors, parseGitHubUrl } from "@/lib/github";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function WindowsAppDetailPage({ params }: PageProps) {
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
      (c) => c.slug === "windows-app" || c.slug === "windows-apps",
    )
  ) {
    notFound();
  }

  const parsed = parseGitHubUrl(resource.repositoryUrl);
  const contributors = parsed
    ? await getContributors(parsed.owner, parsed.repo, 5)
    : [];

  const app: AppDetailData = {
    id: resource.id,
    slug: resource.slug,
    name: resource.name,
    description: resource.description,
    shortDescription: resource.shortDescription,
    oneLiner: resource.oneLiner,
    category: resource.categories[0]?.name ?? "Uncategorized",
    logo: resource.logo,
    image: resource.image,
    stars: resource.stars,
    forks: resource.forks,
    lastCommit: resource.lastCommit,
    repositoryCreatedAt: resource.repositoryCreatedAt,
    license: resource.license,
    repositoryUrl: resource.repositoryUrl,
    tags: resource.tags ?? [],
    categories: resource.categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
    builtWith:
      (resource.builtWith as { name: string; slug: string }[] | null) ?? null,
    platform: "windows",
    user: resource.user,
  };

  return <AppDetailView app={app} contributors={contributors} />;
}
