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
