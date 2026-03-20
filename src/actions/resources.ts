"use server";

import { db } from "@/server/db";
import { Prisma } from "@prisma/client";

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

export async function getResources(page = 1, limit = 20, category?: string, query?: string): Promise<{ success: boolean; data: ResourceWithCategories[]; totalCount: number }> {
    try {
        const skip = (page - 1) * limit;

        const where: Prisma.ResourceWhereInput = {
            status: "APPROVED",
            NOT: {
                categories: {
                    some: {
                        slug: {
                            in: ["github-repo", "github-repos", "android-app", "android-apps", "windows-app", "windows-apps"]
                        }
                    }
                }
            },
            ...(category && category !== "all" ? {
                categories: {
                    some: {
                        OR: [
                            { name: { equals: category, mode: Prisma.QueryMode.insensitive } },
                            { slug: { equals: category, mode: Prisma.QueryMode.insensitive } }
                        ]
                    }
                }
            } : {}),
            ...(query ? {
                OR: [
                    { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
                    { description: { contains: query, mode: Prisma.QueryMode.insensitive } },
                    { shortDescription: { contains: query, mode: Prisma.QueryMode.insensitive } },
                    { oneLiner: { contains: query, mode: Prisma.QueryMode.insensitive } },
                ]
            } : {})
        };

        const [resources, totalCount] = await Promise.all([
            db.resource.findMany({
                where,
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    description: true,
                    shortDescription: true,
                    oneLiner: true,
                    websiteUrl: true,
                    repositoryUrl: true,
                    alternative: true,
                    stars: true,
                    forks: true,
                    lastCommit: true,
                    repositoryCreatedAt: true,
                    image: true,
                    logo: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    addedBy: true,
                    license: true,
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
                skip,
                take: limit,
            }),
            db.resource.count({ where })
        ]);

        return { success: true, data: resources as ResourceWithCategories[], totalCount };
    } catch (error) {
        console.error("[Products] Get Error:", error);
        return { success: false, data: [], totalCount: 0 };
    }
}

export async function getResourcesByCategory(slug: string, page = 1, limit = 20): Promise<{ success: boolean; data: ResourceWithCategories[], totalCount: number, categoryName?: string }> {
    if (!slug) return { success: false, data: [], totalCount: 0 };

    try {
        const category = await db.category.findUnique({
            where: { slug }
        });

        if (!category) {
            return { success: false, data: [], totalCount: 0 };
        }

        const skip = (page - 1) * limit;

        const [resources, totalCount] = await Promise.all([
            db.resource.findMany({
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
                skip,
                take: limit,
            }),
            db.resource.count({
                where: {
                    status: "APPROVED",
                    categories: {
                        some: {
                            slug: slug
                        }
                    }
                }
            })
        ]);

        return { success: true, data: resources, totalCount, categoryName: category.name };
    } catch (error) {
        console.error("[Category Resources] Get Error:", error);
        return { success: false, data: [], totalCount: 0 };
    }
}

export async function getAndroidApps(page = 1, limit = 20): Promise<{ success: boolean; data: ResourceWithCategories[], totalCount: number }> {
    try {
        const skip = (page - 1) * limit;

        const [resources, totalCount] = await Promise.all([
            db.resource.findMany({
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
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    description: true,
                    shortDescription: true,
                    oneLiner: true,
                    websiteUrl: true,
                    repositoryUrl: true,
                    alternative: true,
                    stars: true,
                    forks: true,
                    lastCommit: true,
                    repositoryCreatedAt: true,
                    image: true,
                    logo: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    addedBy: true,
                    license: true,
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
                skip,
                take: limit,
            }),
            db.resource.count({
                where: {
                    status: "APPROVED",
                    categories: {
                        some: {
                            slug: {
                                in: ["android-app", "android-apps"]
                            }
                        }
                    }
                }
            })
        ]);

        return { success: true, data: resources, totalCount };
    } catch (error) {
        console.error("[Android Apps] Get Error:", error);
        return { success: false, data: [], totalCount: 0 };
    }
}

export async function getWindowsApps(page = 1, limit = 20): Promise<{ success: boolean; data: ResourceWithCategories[], totalCount: number }> {
    try {
        const skip = (page - 1) * limit;

        const [resources, totalCount] = await Promise.all([
            db.resource.findMany({
                where: {
                    status: "APPROVED",
                    categories: {
                        some: {
                            slug: {
                                in: ["windows-app", "windows-apps"]
                            }
                        }
                    }
                },
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    description: true,
                    shortDescription: true,
                    oneLiner: true,
                    websiteUrl: true,
                    repositoryUrl: true,
                    alternative: true,
                    stars: true,
                    forks: true,
                    lastCommit: true,
                    repositoryCreatedAt: true,
                    image: true,
                    logo: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    addedBy: true,
                    license: true,
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
                skip,
                take: limit,
            }),
            db.resource.count({
                where: {
                    status: "APPROVED",
                    categories: {
                        some: {
                            slug: {
                                in: ["windows-app", "windows-apps"]
                            }
                        }
                    }
                }
            })
        ]);

        return { success: true, data: resources, totalCount };
    } catch (error) {
        console.error("[Windows Apps] Get Error:", error);
        return { success: false, data: [], totalCount: 0 };
    }
}

export async function getGitHubRepos(page = 1, limit = 20): Promise<{ success: boolean; data: ResourceWithCategories[], totalCount: number }> {
    try {
        const skip = (page - 1) * limit;

        const [resources, totalCount] = await Promise.all([
            db.resource.findMany({
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
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    description: true,
                    shortDescription: true,
                    oneLiner: true,
                    websiteUrl: true,
                    repositoryUrl: true,
                    alternative: true,
                    stars: true,
                    forks: true,
                    lastCommit: true,
                    repositoryCreatedAt: true,
                    image: true,
                    logo: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    addedBy: true,
                    license: true,
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
                skip,
                take: limit,
            }),
            db.resource.count({
                where: {
                    status: "APPROVED",
                    categories: {
                        some: {
                            slug: {
                                in: ["github-repo", "github-repos"]
                            }
                        }
                    }
                }
            })
        ]);

        return { success: true, data: resources, totalCount };
    } catch (error) {
        console.error("[GitHub Repos] Get Error:", error);
        return { success: false, data: [], totalCount: 0 };
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

export async function getLatestResources(page = 1, limit = 20): Promise<{ success: boolean; data: ResourceWithCategories[], totalCount: number }> {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const skip = (page - 1) * limit;

        const [resources, totalCount] = await Promise.all([
            db.resource.findMany({
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
                skip,
                take: limit,
            }),
            db.resource.count({
                where: {
                    status: "APPROVED",
                    createdAt: {
                        gte: twentyFourHoursAgo,
                    },
                },
            })
        ]);

        return { success: true, data: resources, totalCount };
    } catch (error) {
        console.error("[Latest Resources] Get Error:", error);
        return { success: false, data: [], totalCount: 0 };
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
