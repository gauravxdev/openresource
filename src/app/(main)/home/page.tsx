import HeroSection from "@/components/HeroSection"
import MainContainer from "@/components/MainContainer"
import { getResources } from "@/actions/resources"

export const dynamic = "force-dynamic"

export default async function Home() {
    const { data: resources } = await getResources()

    return (
        <div>
            <HeroSection />
            <MainContainer initialResources={resources || []} />
        </div>
    )
}
