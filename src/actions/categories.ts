"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function getCategories() {
    try {
        const categories = await db.category.findMany({
            orderBy: { name: "asc" },
        });
        return { success: true, data: categories };
    } catch (error) {
        console.error("[Categories] Get Error:", error);
        return { success: false, message: "Failed to fetch categories" };
    }
}

export async function addCategory(name: string) {
    if (!name || name.trim().length < 2) {
        return { success: false, message: "Category name must be at least 2 characters" };
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

    try {
        const category = await db.category.create({
            data: {
                name: name.trim(),
                slug,
            },
        });
        revalidatePath("/(admin)/admin"); // Revalidate the submission form path
        return { success: true, data: category, message: "Category added successfully" };
    } catch (error: unknown) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
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
        revalidatePath("/(admin)/admin");
        return { success: true, message: "Category deleted successfully" };
    } catch (error) {
        console.error("[Categories] Delete Error:", error);
        return { success: false, message: "Failed to delete category" };
    }
}
