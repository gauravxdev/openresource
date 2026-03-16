import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { ResourceDetailView } from "@/components/ResourceDetailView";
import { ResourceViewTracker } from "@/components/analytics/ResourceViewTracker";

interface ResourcePageProps {
    params: Promise<{ slug: string }>;
}

export default async function ResourcePage({ params }: ResourcePageProps) {
    const { slug } = await params;

    const resource = await db.resource.findUnique({
        where: { slug },
        include: {
            categories: true,
            user: {
                select: {
                    name: true,
                    username: true,
                    image: true,
                }
            }
        },
    });

    if (!resource) {
        notFound();
    }

    return (
        <>
            <ResourceViewTracker
                resourceId={resource.id}
                resourceName={resource.name}
                resourceSlug={resource.slug}
            />
            <ResourceDetailView resource={resource} />
        </>
    );
}
