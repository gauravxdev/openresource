"use server";

import { db } from "@/server/db";

export type ResourceWithCategories = {
    id: string;
    slug: string;
    name: string;
    description: string;
    shortDescription: string | null;
    oneLiner: string | null;
    websiteUrl: string | null;
    repositoryUrl: string;
    alternative: string | null;
    stars: number;
    forks: number;
    lastCommit: Date | null;
    repositoryCreatedAt: Date | null;
    image: string | null;
    logo: string | null;
    status: string;
    categories: {
        name: string;
        slug: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
    addedBy: string | null;
    license: string | null;
};

export async function getResources() {
    try {
        const resources = await db.resource.findMany({
            where: {
                status: "APPROVED",
                NOT: {
                    categories: {
                        some: {
                            slug: {
                                in: ["github-repo", "github-repos", "android-app", "android-apps"]
                            }
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
        console.error("[Products] Get Error:", error);
        return { success: false, data: [] };
    }
}

export async function getResourcesByCategory(slug: string): Promise<{ success: boolean; data: ResourceWithCategories[], categoryName?: string }> {
    if (!slug) return { success: false, data: [] };

    try {
        const category = await db.category.findUnique({
            where: { slug }
        });

        if (!category) {
            return { success: false, data: [] };
        }

        const resources = await db.resource.findMany({
            where: {
                status: "APPROVED",
                categories: {
                    some: {
                        slug: slug
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
                stars: "desc", // Default sorting for category pages
            },
        });

        return { success: true, data: resources, categoryName: category.name };
    } catch (error) {
        console.error("[Category Resources] Get Error:", error);
        return { success: false, data: [] };
    }
}

export async function getAndroidApps(): Promise<{ success: boolean; data: ResourceWithCategories[] }> {
    try {
        const resources = await db.resource.findMany({
            where: {
                status: "APPROVED",
                categories: {
                    some: {
                        slug: {
                            in: ["android-app", "android-apps"]
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

export async function getGitHubRepos(): Promise<{ success: boolean; data: ResourceWithCategories[] }> {
    try {
        const resources = await db.resource.findMany({
            where: {
                status: "APPROVED",
                categories: {
                    some: {
                        slug: {
                            in: ["github-repo", "github-repos"]
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
                stars: "desc",
            },
        });

        return { success: true, data: resources };
    } catch (error) {
        console.error("[GitHub Repos] Get Error:", error);
        return { success: false, data: [] };
    }
}

export async function getDailyResourceCount(): Promise<{ success: boolean; count: number }> {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const count = await db.resource.count({
            where: {
                status: "APPROVED",
                createdAt: {
                    gte: twentyFourHoursAgo,
                },
            },
        });

        return { success: true, count };
    } catch (error) {
        console.error("[Daily Count] Get Error:", error);
        return { success: false, count: 0 };
    }
}

export async function getLatestResources(): Promise<{ success: boolean; data: ResourceWithCategories[] }> {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const resources = await db.resource.findMany({
            where: {
                status: "APPROVED",
                createdAt: {
                    gte: twentyFourHoursAgo,
                },
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
        console.error("[Latest Resources] Get Error:", error);
        return { success: false, data: [] };
    }
}

export async function searchResources(query: string): Promise<{ success: boolean; data: ResourceWithCategories[] }> {
    if (!query) return { success: true, data: [] };

    try {
        const resources = await db.resource.findMany({
            where: {
                status: "APPROVED",
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                    { shortDescription: { contains: query, mode: "insensitive" } },
                    { oneLiner: { contains: query, mode: "insensitive" } },
                ]
            },
            take: 10,
            include: {
                categories: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
            },
            orderBy: {
                stars: "desc", // order by stars for relevance
            }
        });

        return { success: true, data: resources };
    } catch (error) {
        console.error("[Search] Get Error:", error);
        return { success: false, data: [] };
    }
}
