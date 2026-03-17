"use server";

import { db } from "@/server/db";
import { logAudit } from "@/lib/audit";

export async function getFilteredUsers(role: "user" | "contributor" | "admin" | "all" = "all") {
    try {
        const whereClause = role === "all" ? {} : { role };
        
        const users = await db.user.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,
                lastLoginAt: true,
                role: true,
                status: true,
            }
        });
        return { success: true, data: users };
    } catch (error) {
        console.error("Failed to fetch filtered users:", error);
        return { success: false, data: null, error: "Failed to fetch users" };
    }
}

export async function updateUserStatus(userId: string, status: "ACTIVE" | "RESTRICTED" | "BANNED") {
    try {
        await db.user.update({
            where: { id: userId },
            data: { status }
        });

        await logAudit({
            action: "UPDATE_USER_STATUS",
            userId: userId,
            details: { newStatus: status }
        });

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin/users");

        return { success: true, message: "User status updated successfully" };
    } catch (error) {
        console.error("Failed to update user status:", error);
        return { success: false, error: "Failed to update user status" };
    }
}

export async function updateUserRole(userId: string, role: "user" | "contributor" | "admin") {
    try {
        await db.user.update({
            where: { id: userId },
            data: { role }
        });

        await logAudit({
            action: "UPDATE_USER_ROLE",
            userId: userId,
            details: { newRole: role }
        });

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin/users");

        return { success: true, message: "User role updated successfully" };
    } catch (error) {
        console.error("Failed to update user role:", error);
        return { success: false, error: "Failed to update user role" };
    }
}
