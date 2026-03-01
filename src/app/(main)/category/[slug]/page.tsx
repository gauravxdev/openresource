import { notFound } from "next/navigation"
import { getResourcesByCategory } from "@/actions/resources"
import MainContainer from "@/components/MainContainer"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const dynamic = "force-dynamic"

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const { success, data: resources, categoryName } = await getResourcesByCategory(slug)

    if (!success || !categoryName) {
        notFound()
    }

    return (
        <div className="w-full bg-background min-h-screen pt-4 md:pt-8">
            <div className="mx-auto max-w-[1152px] px-5 pb-4 md:px-6">
                <div className="mb-4">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/categories">Categories</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{categoryName}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                        {categoryName} Resources
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Explore {resources.length} open-source projects in the {categoryName} category.
                    </p>
                </div>
            </div>

            {/* We reuse the MainContainer, filtering helps if search is needed within this category */}
            <MainContainer initialResources={resources} />
        </div>
    )
}
