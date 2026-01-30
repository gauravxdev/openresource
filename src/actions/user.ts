"use server";

import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateUserImage(imageUrl: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return { success: false, message: "Not authenticated" };
        }

        await db.user.update({
            where: { id: session.user.id },
            data: { image: imageUrl },
        });

        revalidatePath("/profile");
        revalidatePath("/", "layout");

        return { success: true, message: "Profile picture updated successfully!" };
    } catch (error) {
        console.error("[User Action] Error:", error);
        return { success: false, message: "Failed to update profile picture" };
    }
}

export async function updateUserProfile(data: { name: string }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return { success: false, message: "Not authenticated" };
        }

        if (!data.name || data.name.trim().length === 0) {
            return { success: false, message: "Name is required" };
        }

        await db.user.update({
            where: { id: session.user.id },
            data: { name: data.name },
        });

        revalidatePath("/profile");

        return { success: true, message: "Profile updated successfully!" };
    } catch (error) {
        console.error("[User Action] Update Profile Error:", error);
        return { success: false, message: "Failed to update profile" };
    }
}
