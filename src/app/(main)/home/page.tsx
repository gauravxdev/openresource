import HeroSection from "@/components/HeroSection"
import dynamic from "next/dynamic"
import { getResources } from "@/actions/resources"

const MainContainer = dynamic(() => import("@/components/MainContainer"))

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
