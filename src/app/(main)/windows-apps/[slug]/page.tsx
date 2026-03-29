import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { AppDetailView, type AppDetailData } from "@/components/AppDetailView";

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

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - resource.updatedAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  let lastUpdated = `${diffDays} days ago`;
  if (diffDays === 0) lastUpdated = "Today";
  if (diffDays === 1) lastUpdated = "Yesterday";
  if (diffDays > 30) lastUpdated = `${Math.floor(diffDays / 30)} months ago`;
  if (diffDays > 365) lastUpdated = `${Math.floor(diffDays / 365)} years ago`;

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
    rating: "4.5",
    downloads: "1k+",
    lastUpdated,
    license: resource.license,
    repositoryUrl: resource.repositoryUrl,
    tags: resource.tags ?? [],
    platform: "windows",
    user: resource.user,
  };

  return <AppDetailView app={app} />;
}
