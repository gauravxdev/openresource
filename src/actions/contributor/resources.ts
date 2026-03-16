"use server";

import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const resourceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().min(1, "Description is required"),
    shortDescription: z.string().optional(),
    oneLiner: z.string().optional(),
    websiteUrl: z.string().url().optional().or(z.literal("")),
    repositoryUrl: z.string().url("Must be a valid URL"),
    alternative: z.string().optional(),
    image: z.string().optional(),
    logo: z.string().optional(),
});

async function getAuthenticatedContributor() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return null;
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true },
    });

    if (!user || (user.role !== "contributor" && user.role !== "admin")) {
        return null;
    }

    return user;
}

export async function getContributorResources(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
}) {
    const user = await getAuthenticatedContributor();
    if (!user) {
        return { success: false, data: [], metadata: { total: 0, page: 1, totalPages: 1 }, error: "Unauthorized" };
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;
    const search = params?.search ?? "";
    const status = params?.status;
    const sortBy = params?.sortBy ?? "newest";

    try {
        const where: any = { userId: user.id };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        if (status && status !== "ALL") {
            where.status = status;
        }

        let orderBy: any = { createdAt: "desc" };
        if (sortBy === "oldest") orderBy = { createdAt: "asc" };
        if (sortBy === "name-asc") orderBy = { name: "asc" };
        if (sortBy === "name-desc") orderBy = { name: "desc" };

        const [resources, total] = await Promise.all([
            db.resource.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    categories: {
                        select: { name: true, slug: true },
                    },
                },
            }),
            db.resource.count({ where }),
        ]);

        return {
            success: true,
            data: resources,
            metadata: {
                total,
                page,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("[Contributor Resources] Get Error:", error);
        return {
            success: false,
            data: [],
            metadata: { total: 0, page: 1, totalPages: 1 },
            error: "Failed to fetch resources",
        };
    }
}

export async function getContributorStats() {
    const user = await getAuthenticatedContributor();
    if (!user) {
        return { success: false, data: null, error: "Unauthorized" };
    }

    try {
        const [total, approved, pending, rejected] = await Promise.all([
            db.resource.count({ where: { userId: user.id } }),
            db.resource.count({ where: { userId: user.id, status: "APPROVED" } }),
            db.resource.count({ where: { userId: user.id, status: "PENDING" } }),
            db.resource.count({ where: { userId: user.id, status: "REJECTED" } }),
        ]);

        return {
            success: true,
            data: { total, approved, pending, rejected },
        };
    } catch (error) {
        console.error("[Contributor Stats] Error:", error);
        return { success: false, data: null, error: "Failed to fetch stats" };
    }
}

export async function updateContributorResource(
    id: string,
    data: Partial<z.infer<typeof resourceSchema>>
) {
    const user = await getAuthenticatedContributor();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Verify ownership
        const resource = await db.resource.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!resource || resource.userId !== user.id) {
            return { success: false, error: "Resource not found or not owned by you" };
        }

        const updated = await db.resource.update({
            where: { id },
            data: {
                ...data,
                // Reset status to pending on edit so admin re-reviews
                status: "PENDING",
            },
        });

        revalidatePath("/dashboard/resources");
        revalidatePath("/dashboard");
        revalidatePath("/home");

        return { success: true, data: updated };
    } catch (error) {
        console.error("[Contributor Resources] Update Error:", error);
        return { success: false, error: "Failed to update resource" };
    }
}

export async function deleteContributorResource(id: string) {
    const user = await getAuthenticatedContributor();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Verify ownership
        const resource = await db.resource.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!resource || resource.userId !== user.id) {
            return { success: false, error: "Resource not found or not owned by you" };
        }

        await db.resource.delete({ where: { id } });

        revalidatePath("/dashboard/resources");
        revalidatePath("/dashboard");
        revalidatePath("/home");

        return { success: true };
    } catch (error) {
        console.error("[Contributor Resources] Delete Error:", error);
        return { success: false, error: "Failed to delete resource" };
    }
}

export async function getContributorResourceById(id: string) {
    const user = await getAuthenticatedContributor();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const resource = await db.resource.findUnique({
            where: { id },
            include: {
                categories: {
                    select: { name: true, slug: true },
                },
            },
        });

        if (!resource || resource.userId !== user.id) {
            return { success: false, error: "Resource not found or not owned by you" };
        }

        return { success: true, data: resource };
    } catch (error) {
        console.error("[Contributor Resources] Get By Id Error:", error);
        return { success: false, error: "Failed to fetch resource" };
    }
}
