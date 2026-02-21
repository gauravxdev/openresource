import { getLatestResources } from "@/actions/resources"
import { ResourceCard } from "@/components/ResourceCard"
import { FolderOpen } from "lucide-react"

export const metadata = {
    title: "Latest Resources - OpenResource",
    description: "Browse the latest open-source tools and resources added in the last 24 hours.",
}

export default async function LatestResourcesPage() {
    const { data: resources, success } = await getLatestResources()

    // Ensure dates are parsed correctly if they come back as strings or Date objects
    const serializeDate = (date: Date | string | null) => {
        if (!date) return new Date().toISOString()
        return new Date(date).toISOString()
    }

    return (
        <div className="mx-auto max-w-[1152px] px-4 md:px-6 py-8 md:py-12">
            <div className="mb-8 md:mb-12 text-center md:text-left">
                <h1 className="text-3xl font-bold tracking-tight mb-3">Latest Additions</h1>
                <p className="text-lg text-muted-foreground w-full md:max-w-3xl">
                    Discover the freshest open-source tools, apps, and resources added to OpenResource in the last 24 hours.
                </p>
            </div>

            {!success || !resources || resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4 rounded-xl border border-dashed border-border/60 bg-muted/10">
                    <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-6">
                        <FolderOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No new resources found</h3>
                    <p className="text-muted-foreground max-w-sm">
                        Check back later! We are constantly updating our directory with new tools and resources.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map((resource) => (
                        <div key={resource.id} className="h-full">
                            <ResourceCard
                                resource={{
                                    id: resource.id,
                                    slug: resource.slug,
                                    title: resource.name,
                                    description: resource.description,
                                    shortDescription: resource.shortDescription,
                                    oneLiner: resource.oneLiner,
                                    alternative: resource.alternative,
                                    category: resource.categories[0]?.name ?? "Uncategorized",
                                    stars: resource.stars.toString(),
                                    forks: resource.forks.toString(),
                                    lastCommit: serializeDate(resource.createdAt).split('T')[0]!,
                                    image: resource.image ?? "/images/placeholder.png",
                                    logo: resource.logo,
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
