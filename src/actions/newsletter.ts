"use server";

import { z } from "zod";
import { db } from "@/server/db";

const emailSchema = z.string().email("Please enter a valid email address");

export type NewsletterResult = {
    success: boolean;
    message: string;
};

export async function joinNewsletter(email: string): Promise<NewsletterResult> {
    try {
        // Validate email
        const validatedEmail = emailSchema.parse(email.toLowerCase().trim());

        // Check if email already exists
        const existingEntry = await db.newsletter.findUnique({
            where: { email: validatedEmail },
        });

        if (existingEntry) {
            return {
                success: false,
                message: "This email is already subscribed!",
            };
        }

        // Add to newsletter
        await db.newsletter.create({
            data: { email: validatedEmail },
        });

        return {
            success: true,
            message: "Successfully subscribed to the newsletter!",
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                message: error.errors[0]?.message ?? "Invalid email address",
            };
        }

        console.error("[Newsletter] Error:", error);
        return {
            success: false,
            message: "Something went wrong. Please try again later.",
        };
    }
}
