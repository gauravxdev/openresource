import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { ResourceDetailView, type Resource } from "@/components/ResourceDetailView";
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

    // Cast to unknown then to Resource to handle Prisma type mismatches gracefully
    // and satisfy the linter without using 'any'
    const rawResource = resource as unknown as Resource;
    const resourceData: Resource = {
        ...rawResource,
        builtWith: rawResource.builtWith ?? null,
        tags: rawResource.tags ?? [],
    };

    return (
        <>
            <ResourceViewTracker
                resourceId={resourceData.id}
                resourceName={resourceData.name}
                resourceSlug={resourceData.slug}
            />
            <ResourceDetailView resource={resourceData} />
        </>
    );
}
