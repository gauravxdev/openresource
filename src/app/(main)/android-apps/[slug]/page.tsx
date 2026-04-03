import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/server/db";
import { AppDetailView, type AppDetailData } from "@/components/AppDetailView";
import { getContributors, parseGitHubUrl } from "@/lib/github";
import { SimilarResources } from "@/components/SimilarResources";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://openresource.site";

  const resource = await db.resource.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      shortDescription: true,
      oneLiner: true,
    },
  });

  if (!resource) {
    return {
      title: "Android App Not Found - OpenResource",
    };
  }

  const title = resource.name;
  const description =
    resource.oneLiner ?? resource.shortDescription ?? resource.description;

  return {
    title: `${title} - Android App - OpenResource`,
    description: description.slice(0, 160),
    alternates: {
      canonical: `${baseUrl}/android-apps/${slug}`,
    },
    openGraph: {
      title: `${title} - Android App - OpenResource`,
      description: description.slice(0, 160),
      url: `${baseUrl}/android-apps/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - Android App - OpenResource`,
      description: description.slice(0, 160),
    },
  };
}

export default async function AndroidAppDetailPage({ params }: PageProps) {
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
    !resource?.categories.some(
      (c) => c.slug === "android-app" || c.slug === "android-apps",
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
    platform: "android",
    user: resource.user,
  };

  return (
    <AppDetailView app={app} contributors={contributors}>
      <SimilarResources currentSlug={slug} currentName={resource.name} />
    </AppDetailView>
  );
}
