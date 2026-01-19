"use server";

import { z } from "zod";
import { db } from "@/server/db";

const submissionSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    websiteUrl: z.string().url("Please enter a valid Website URL"),
    repositoryUrl: z.string().url("Please enter a valid Repository URL"),
    category: z.string().min(1, "Please select a category"),
    alternative: z.string().optional(),
});

export type SubmissionResult = {
    success: boolean;
    message: string;
};

export async function submitResource(formData: FormData): Promise<SubmissionResult> {
    const rawData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        websiteUrl: formData.get("websiteUrl") as string,
        repositoryUrl: formData.get("repositoryUrl") as string,
        category: formData.get("category") as string,
        alternative: formData.get("alternative") as string,
    };

    try {
        const validatedData = submissionSchema.parse(rawData);

        await db.resource.create({
            data: {
                ...validatedData,
                status: "APPROVED", // Since this is the admin submit page
                addedBy: "ADMIN",
            },
        });

        return {
            success: true,
            message: "Resource successfully added!",
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                message: error.errors[0]?.message ?? "Invalid form data",
            };
        }

        console.error("[Submission] Error:", error);
        return {
            success: false,
            message: "Something went wrong. Please try again later.",
        };
    }
}
