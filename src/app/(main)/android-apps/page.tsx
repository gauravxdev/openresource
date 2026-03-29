import React from "react";
import dynamic from "next/dynamic";
import { getAndroidApps } from "@/actions/resources";
import { type AndroidApp } from "@/lib/android-apps-data";

const AndroidAppsClient = dynamic(() => import("./android-apps-client"));

export const revalidate = 60;

export default async function AndroidApps({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const currentPage = Number(pageStr) || 1;
  const { data: resources, totalCount } = await getAndroidApps(currentPage, 12);

  // Map DB resources to AndroidApp interface
  const dbApps: AndroidApp[] = resources.map((resource) => {
    // Calculate relative time for lastUpdated
    const now = new Date();
    const lastUpdatedDate = resource.updatedAt;
    const diffTime = Math.abs(now.getTime() - lastUpdatedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let lastUpdatedStr = `${diffDays} days ago`;
    if (diffDays === 0) lastUpdatedStr = "Today";
    if (diffDays === 1) lastUpdatedStr = "Yesterday";
    if (diffDays > 30)
      lastUpdatedStr = `${Math.floor(diffDays / 30)} months ago`;
    if (diffDays > 365)
      lastUpdatedStr = `${Math.floor(diffDays / 365)} years ago`;

    return {
      id: resource.id,
      slug: resource.slug,
      title: resource.name,
      description:
        resource.oneLiner ?? resource.shortDescription ?? resource.description,
      category: resource.categories[0]?.name ?? "Uncategorized", // Fallback to first category
      downloads: "1k+", // Placeholder as requested
      rating: "4.5", // Placeholder as requested
      lastUpdated: lastUpdatedStr,
      image: resource.image ?? "/api/placeholder/300/200", // Fallback image
      logo: resource.logo,
      developer: resource.addedBy ?? "Unknown",
      license: resource.license ?? "Free",
      stars: resource.stars ? `${(resource.stars / 1000).toFixed(1)}k` : "0",
      tags: resource.categories.map((c) => c.name), // Use categories as tags
      repositoryUrl: resource.repositoryUrl,
    };
  });

  return (
    <AndroidAppsClient
      initialApps={dbApps}
      totalCount={totalCount || 0}
      currentPage={currentPage}
    />
  );
}
