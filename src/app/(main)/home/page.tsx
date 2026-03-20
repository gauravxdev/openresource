import HeroSection from "@/components/HeroSection"
import { getResources } from "@/actions/resources"
import MainContainer from "@/components/MainContainer"

export const revalidate = 60

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page: pageStr } = await searchParams
    const currentPage = Number(pageStr) || 1
    const { data: resources, totalCount } = await getResources(currentPage)

    return (
        <div>
            <HeroSection />
            <MainContainer
                initialResources={resources || []}
                totalCount={totalCount || 0}
                currentPage={currentPage}
            />
        </div>
    )
}
