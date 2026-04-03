import React from "react";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { getWindowsApps } from "@/actions/resources";
import { type WindowsApp } from "@/lib/windows-apps-data";

const WindowsAppsClient = dynamic(() => import("./windows-apps-client"));

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Windows Apps - OpenResource",
  description:
    "Discover open-source Windows applications and software. Browse a curated collection of Windows apps, developer tools, and self-hosted solutions.",
  alternates: {
    canonical: "https://openresource.site/windows-apps",
  },
  openGraph: {
    title: "Windows Apps - OpenResource",
    description:
      "Discover open-source Windows applications and software. Browse a curated collection of Windows apps, developer tools, and self-hosted solutions.",
    url: "https://openresource.site/windows-apps",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Windows Apps - OpenResource",
    description:
      "Discover open-source Windows applications and software. Browse a curated collection of Windows apps, developer tools, and self-hosted solutions.",
  },
};

export default async function WindowsApps({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const currentPage = Number(pageStr) || 1;
  const { data: resources, totalCount } = await getWindowsApps(currentPage, 12);

  // Map DB resources to WindowsApp interface
  const dbApps: WindowsApp[] = resources.map((resource) => {
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
      category: resource.categories[0]?.name ?? "Uncategorized",
      downloads: "1k+",
      rating: "4.5",
      lastUpdated: lastUpdatedStr,
      image: resource.image ?? "/api/placeholder/300/200",
      logo: resource.logo,
      developer: resource.addedBy ?? "Unknown",
      license: resource.license ?? "Free",
      stars: resource.stars ? `${(resource.stars / 1000).toFixed(1)}k` : "0",
      tags: resource.categories.map((c) => c.name),
      repositoryUrl: resource.repositoryUrl,
    };
  });

  return (
    <WindowsAppsClient
      initialApps={dbApps}
      totalCount={totalCount || 0}
      currentPage={currentPage}
    />
  );
}
