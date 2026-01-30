"use server";

import { db } from "@/server/db";

export type ResourceWithCategories = {
    id: string;
    slug: string;
    name: string;
    description: string;
    shortDescription: string | null;
    websiteUrl: string | null;
    repositoryUrl: string;
    alternative: string | null;
    stars: number;
    forks: number;
    lastCommit: Date | null;
    image: string | null;
    logo: string | null;
    status: string;
    categories: {
        name: string;
        slug: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
};

export async function getResources() {
    try {
        const resources = await db.resource.findMany({
            where: {
                status: "APPROVED",
            },
            include: {
                categories: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Serialize Date objects to strings if needed by Client Components 
        // passing across the server/client boundary usually requires plain objects,
        // but Server Components -> Client Components largely handles dates fine as of recent Next.js versions.
        // However, if we run into serialization issues, we can convert dates here.
        // For now, let's return the raw objects and safe-guard on the client or mapped type.

        return { success: true, data: resources };
    } catch (error) {
        console.error("[Products] Get Error:", error);
        return { success: false, data: [] };
    }
}

export async function getAndroidApps() {
    try {
        const resources = await db.resource.findMany({
            where: {
                status: "APPROVED",
                categories: {
                    some: {
                        slug: {
                            in: ["android", "android-app", "android-apps"]
                        }
                    }
                }
            },
            include: {
                categories: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return { success: true, data: resources };
    } catch (error) {
        console.error("[Android Apps] Get Error:", error);
        return { success: false, data: [] };
    }
}
