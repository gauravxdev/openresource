import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { ResourceDetailView } from "@/components/ResourceDetailView";

interface ResourcePageProps {
    params: Promise<{ slug: string }>;
}

export default async function ResourcePage({ params }: ResourcePageProps) {
    const { slug } = await params;

    const resource = await db.resource.findUnique({
        where: { slug },
        include: {
            categories: true,
        },
    });

    if (!resource) {
        notFound();
    }

    return <ResourceDetailView resource={resource} />;
}
