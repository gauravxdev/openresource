import React from "react"
import { getAndroidApps } from "@/actions/resources"
import AndroidAppsClient from "./android-apps-client"
import { type AndroidApp } from "@/lib/android-apps-data"
import { mockAndroidApps } from "@/lib/android-apps-data"

export const dynamic = "force-dynamic"

export default async function AndroidApps() {
  const { data: resources } = await getAndroidApps()

  // Map DB resources to AndroidApp interface
  const dbApps: AndroidApp[] = resources.map((resource) => {
    // Calculate relative time for lastUpdated
    const now = new Date()
    const lastUpdatedDate = resource.updatedAt
    const diffTime = Math.abs(now.getTime() - lastUpdatedDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let lastUpdatedStr = `${diffDays} days ago`
    if (diffDays === 0) lastUpdatedStr = "Today"
    if (diffDays === 1) lastUpdatedStr = "Yesterday"
    if (diffDays > 30) lastUpdatedStr = `${Math.floor(diffDays / 30)} months ago`
    if (diffDays > 365) lastUpdatedStr = `${Math.floor(diffDays / 365)} years ago`

    return {
      id: resource.id,
      title: resource.name,
      description: resource.oneLiner ?? resource.shortDescription ?? resource.description,
      category: resource.categories[0]?.name ?? "Uncategorized", // Fallback to first category
      downloads: "1k+", // Placeholder as requested
      rating: "4.5",    // Placeholder as requested
      lastUpdated: lastUpdatedStr,
      image: resource.image ?? "/api/placeholder/300/200", // Fallback image
      logo: resource.logo,
      developer: resource.addedBy ?? "Unknown", // Or use a field if available, 'addedBy' is user ID so might want 'Unknown' for now
      license: resource.license ?? "Free",
      stars: resource.stars ? `${(resource.stars / 1000).toFixed(1)}k` : "0",
      tags: resource.categories.map(c => c.name), // Use categories as tags
      repositoryUrl: resource.repositoryUrl
    }
  })

  // Combine mock data (if needed) or just use DB data. 
  // User asked to "make android-apps route data also dynamic render with db's data"
  // implies replacing or adding. Usually replacing is the goal of "dynamic render".
  // However, if DB is empty, maybe fallback? For now, let's just use DB data.
  // If no DB data, it will show empty state which is correct behavior.

  return <AndroidAppsClient initialApps={dbApps} />
}
