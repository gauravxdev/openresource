import HeroSection from "@/components/HeroSection"
import { getResources } from "@/actions/resources"
import { getCategories } from "@/actions/categories"
import MainContainer from "@/components/MainContainer"

export const revalidate = 60

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string, category?: string, q?: string }> }) {
    const { page: pageStr, category, q } = await searchParams
    const currentPage = Number(pageStr) || 1
    const { data: resources, totalCount } = await getResources(currentPage, 20, category, q)
    const { data: categories = [] } = await getCategories()

    return (
        <div>
            <HeroSection />
            <MainContainer
                initialResources={resources || []}
                totalCount={totalCount || 0}
                currentPage={currentPage}
                categories={categories.map(c => c.name)}
                selectedCategory={category ?? "all"}
                searchTerm={q ?? ""}
            />
        </div>
    )
}
