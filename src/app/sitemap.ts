import type { MetadataRoute } from "next";
import { db } from "@/server/db";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://openresource.site";

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tags`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/browse/latest`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/browse/alternatives`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/browse/self-hosted`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/browse/most-forked`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/browse/licenses`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/github-repos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/windows-apps`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/android-apps`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/submit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const approvedResources = await db.resource.findMany({
    where: { status: "APPROVED" },
    select: {
      slug: true,
      categories: {
        select: { slug: true },
      },
      updatedAt: true,
    },
    take: 1000,
    orderBy: { updatedAt: "desc" },
  });

  const resourcePages: MetadataRoute.Sitemap = approvedResources.map(
    (resource) => {
      let url = `${BASE_URL}/resource/${resource.slug}`;

      if (
        resource.categories.some(
          (c) => c.slug === "windows-app" || c.slug === "windows-apps",
        )
      ) {
        url = `${BASE_URL}/windows-apps/${resource.slug}`;
      } else if (
        resource.categories.some(
          (c) => c.slug === "android-app" || c.slug === "android-apps",
        )
      ) {
        url = `${BASE_URL}/android-apps/${resource.slug}`;
      } else if (
        resource.categories.some(
          (c) => c.slug === "github-repo" || c.slug === "github-repos",
        )
      ) {
        url = `${BASE_URL}/github-repos/${resource.slug}`;
      }

      return {
        url,
        lastModified: resource.updatedAt,
        changeFrequency: "weekly" as const,
        priority: resource.categories.some(
          (c) =>
            c.slug === "windows-app" ||
            c.slug === "android-app" ||
            c.slug === "github-repo",
        )
          ? 0.7
          : 0.8,
      };
    },
  );

  const approvedCategories = await db.category.findMany({
    where: { status: "APPROVED" },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const categoryPages: MetadataRoute.Sitemap = approvedCategories.map(
    (category) => ({
      url: `${BASE_URL}/category/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }),
  );

  return [...staticPages, ...resourcePages, ...categoryPages];
}
