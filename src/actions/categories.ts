"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function getCategories(includeAllStatuses = false) {
  try {
    const categories = await db.category.findMany({
      where: includeAllStatuses ? {} : { status: "APPROVED" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        addedBy: true,
        userId: true,
        createdAt: true,
        rejectionReason: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error("[Categories] Get Error:", error);
    return { success: false, message: "Failed to fetch categories" };
  }
}

export async function getAdminCategories(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const skip = (page - 1) * limit;
  const search = params?.search ?? "";
  const status = params?.status;

  try {
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const [categories, total] = await Promise.all([
      db.category.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          addedBy: true,
          userId: true,
          createdAt: true,
          rejectionReason: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          _count: {
            select: { resources: true },
          },
        },
      }),
      db.category.count({ where }),
    ]);

    return {
      success: true,
      data: categories,
      metadata: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[Admin Categories] Get Error:", error);
    return {
      success: false,
      data: [],
      metadata: { total: 0, page: 1, totalPages: 1 },
      message: "Failed to fetch categories",
    };
  }
}

export async function addCategory(
  name: string,
  addedBy: "ADMIN" | "USER" = "USER",
  userId?: string,
) {
  if (!name || name.trim().length < 2) {
    return {
      success: false,
      message: "Category name must be at least 2 characters",
    };
  }

  const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

  try {
    const category = await db.category.create({
      data: {
        name: name.trim(),
        slug,
        status: addedBy === "ADMIN" ? "APPROVED" : "PENDING",
        addedBy,
        userId: userId ?? null,
      },
    });

    revalidatePath("/admin/resources");
    revalidatePath("/admin/categories");
    revalidatePath("/categories");

    if (addedBy === "ADMIN") {
      return {
        success: true,
        data: category,
        message: "Category added successfully",
      };
    }
    return {
      success: true,
      data: category,
      message: "Category submitted for admin approval",
    };
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { success: false, message: "Category already exists" };
    }
    console.error("[Categories] Add Error:", error);
    return { success: false, message: "Failed to add category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await db.category.delete({
      where: { id },
    });
    revalidatePath("/admin/resources");
    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    console.error("[Categories] Delete Error:", error);
    return { success: false, message: "Failed to delete category" };
  }
}

export async function updateCategoryStatus(
  id: string,
  status: "PENDING" | "APPROVED" | "REJECTED",
  rejectionReason?: string,
) {
  try {
    const updateData: Record<string, unknown> = { status };
    if (status === "REJECTED" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    } else if (status !== "REJECTED") {
      updateData.rejectionReason = null;
    }

    await db.category.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    return {
      success: true,
      message: `Category ${status.toLowerCase()} successfully`,
    };
  } catch (error) {
    console.error("[Categories] Update Status Error:", error);
    return { success: false, message: "Failed to update category status" };
  }
}
