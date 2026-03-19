import { notFound } from "next/navigation"
import dynamic from "next/dynamic"
import { getResourcesByCategory } from "@/actions/resources"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import MainContainer from "@/components/MainContainer"

export const revalidate = 60

export default async function CategoryPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ page?: string }>
}) {
    const { slug } = await params
    const { page: pageStr } = await searchParams
    const currentPage = Number(pageStr) || 1

    const { success, data: resources, totalCount, categoryName } = await getResourcesByCategory(slug, currentPage)

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
                        Explore projects in the {categoryName} category.
                    </p>
                </div>
            </div>

            <MainContainer
                initialResources={resources}
                totalCount={totalCount || 0}
                currentPage={currentPage}
            />
        </div>
    )
}
