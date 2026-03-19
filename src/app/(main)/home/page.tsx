import HeroSection from "@/components/HeroSection"
import dynamic from "next/dynamic"
import { getResources } from "@/actions/resources"

// Lazy-load MainContainer to keep initial bundle small
const MainContainer = dynamic(() => import("@/components/MainContainer"), {
    loading: () => <div className="mx-auto max-w-[1152px] h-96 animate-pulse bg-muted/20" />
})

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
