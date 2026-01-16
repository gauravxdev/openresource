"use server";

import { z } from "zod";
import { db } from "@/server/db";

const emailSchema = z.string().email("Please enter a valid email address");

export type WaitlistResult = {
    success: boolean;
    message: string;
};

export async function joinWaitlist(email: string): Promise<WaitlistResult> {
    try {
        // Validate email
        const validatedEmail = emailSchema.parse(email.toLowerCase().trim());

        // Check if email already exists
        const existingEntry = await db.waitlist.findUnique({
            where: { email: validatedEmail },
        });

        if (existingEntry) {
            return {
                success: false,
                message: "This email is already on the waitlist!",
            };
        }

        // Add to waitlist
        await db.waitlist.create({
            data: { email: validatedEmail },
        });

        return {
            success: true,
            message: "You're on the list! We'll notify you when we launch.",
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                message: error.errors[0]?.message ?? "Invalid email address",
            };
        }

        console.error("[Waitlist] Error:", error);
        return {
            success: false,
            message: "Something went wrong. Please try again later.",
        };
    }
}
