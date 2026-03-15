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

const RESERVED_USERNAMES = [
    "admin", "support", "root", "api", "system", "login", 
    "signup", "settings", "dashboard", "openresource", 
    "thehumanlord", "openresourcesite", "openresourceai", 
    "contributor", "visitor", "curator", "gaurav", "gauravsharma"
];

export async function checkUsernameAvailability(username: string) {
    if (!username || username.trim().length === 0) {
        return { available: false, error: "Username is required" };
    }

    const regex = /^[a-zA-Z0-9_]{5,20}$/;
    if (!regex.test(username)) {
        return { available: false, error: "5-20 characters, alphanumeric & underscores only" };
    }

    const lowerUsername = username.toLowerCase();

    if (RESERVED_USERNAMES.includes(lowerUsername)) {
        return { available: false, error: "This username is reserved and cannot be used" };
    }

    try {
        const existingUser = await db.user.findUnique({
            where: { username: lowerUsername },
            select: { id: true },
        });

        if (existingUser) {
            return { available: false, error: "Username already taken" };
        }

        return { available: true };
    } catch (error) {
        console.error("[User Action] Check Username Availability Error:", error);
        return { available: false, error: "Failed to check availability" };
    }
}

export async function updateUsername(username: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return { success: false, message: "Not authenticated" };
        }

        const existingRecord = await db.user.findUnique({
            where: { id: session.user.id },
            select: { usernameUpdatedAt: true }
        });

        if (existingRecord?.usernameUpdatedAt) {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            if (existingRecord.usernameUpdatedAt > thirtyDaysAgo) {
                return { success: false, message: "You can only change your username once every 30 days." };
            }
        }

        const availability = await checkUsernameAvailability(username);
        if (!availability.available) {
            return { success: false, message: availability.error || "Username invalid or taken" };
        }

        try {
            await db.user.update({
                where: { id: session.user.id },
                data: { 
                    username: username.toLowerCase(),
                    usernameUpdatedAt: new Date()
                },
            });
        } catch (updateError: any) {
            // P2002 is the Prisma error code for Unique Constraint Violation
            if (updateError.code === 'P2002') {
                return { success: false, message: "This username was just taken by someone else!" };
            }
            throw updateError;
        }

        revalidatePath("/profile");
        // Also revalidate layout or user-related routes if username is shown in navbar
        revalidatePath("/", "layout");

        return { success: true, message: "Username updated successfully!" };
    } catch (error) {
        console.error("[User Action] Update Username Error:", error);
        return { success: false, message: "Failed to update username" };
    }
}
