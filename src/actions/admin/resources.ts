/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/prefer-nullish-coalescing */
"use server";

import { db } from "@/server/db";
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
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export async function getAdminResources(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  sortBy?: string;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const skip = (page - 1) * limit;
  const search = params?.search ?? "";
  const status = params?.status;

  const category = params?.category;
  const sortBy = params?.sortBy ?? "newest";

  try {
    const where: any = {};

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

    if (category && category !== "ALL") {
      where.categories = {
        some: {
          name: category,
        },
      };
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
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          categories: {
            select: {
              name: true,
              slug: true,
            },
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
    console.error("[Admin Resources] Get Error:", error);
    return {
      success: false,
      data: [],
      metadata: { total: 0, page: 1, totalPages: 1 },
      error: "Failed to fetch resources",
    };
  }
}

export async function createAdminResource(
  data: z.infer<typeof resourceSchema>,
) {
  try {
    const validatedData = resourceSchema.parse(data);

    const resource = await db.resource.create({
      data: validatedData,
    });

    revalidatePath("/admin/resources");
    revalidatePath("/home");
    revalidatePath("/github-repos");
    revalidatePath("/android-apps");

    return { success: true, data: resource };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Validation failed",
      };
    }
    console.error("[Admin Resources] Create Error:", error);
    return { success: false, error: "Failed to create resource" };
  }
}

export async function updateAdminResource(
  id: string,
  data: Partial<z.infer<typeof resourceSchema>>,
) {
  try {
    // For partial updates, we might want to validate only provided fields
    // but for simplicity let's assume we get the full object or validate what we get
    const resource = await db.resource.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/resources");
    revalidatePath("/home");
    revalidatePath("/github-repos");
    revalidatePath("/android-apps");

    return { success: true, data: resource };
  } catch (error) {
    console.error("[Admin Resources] Update Error:", error);
    return { success: false, error: "Failed to update resource" };
  }
}

export async function updateAdminResourceStatus(
  id: string,
  status: "PENDING" | "APPROVED" | "REJECTED",
  rejectionReason?: string,
) {
  try {
    const updateData: any = { status };
    if (status === "REJECTED" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    } else if (status !== "REJECTED") {
      updateData.rejectionReason = null;
    }

    const resource = await db.resource.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/resources");
    revalidatePath("/home");
    revalidatePath("/github-repos");
    revalidatePath("/android-apps");

    return { success: true, data: resource };
  } catch (error) {
    console.error("[Admin Resources] Update Status Error:", error);
    return { success: false, error: "Failed to update resource status" };
  }
}

export async function deleteAdminResource(id: string) {
  try {
    await db.resource.delete({
      where: { id },
    });

    revalidatePath("/admin/resources");
    revalidatePath("/home");
    revalidatePath("/github-repos");
    revalidatePath("/android-apps");

    return { success: true };
  } catch (error) {
    console.error("[Admin Resources] Delete Error:", error);
    return { success: false, error: "Failed to delete resource" };
  }
}

export async function getAdminResourceById(id: string) {
  try {
    const resource = await db.resource.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!resource) {
      return { success: false, error: "Resource not found" };
    }

    return { success: true, data: resource };
  } catch (error) {
    console.error("[Admin Resources] Get By Id Error:", error);
    return { success: false, error: "Failed to fetch resource" };
  }
}
