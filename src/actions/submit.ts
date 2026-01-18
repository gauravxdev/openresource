"use server";

import { z } from "zod";

const submissionSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    websiteUrl: z.string().url("Please enter a valid Website URL"),
    repositoryUrl: z.string().url("Please enter a valid Repository URL"),
    alternative: z.string().optional(),
    category: z.string().optional(),
});

export type SubmissionResult = {
    success: boolean;
    message: string;
};

export async function submitResource(formData: FormData): Promise<SubmissionResult> {
    const rawData = {
        name: formData.get("name") as string,
        websiteUrl: formData.get("websiteUrl") as string,
        repositoryUrl: formData.get("repositoryUrl") as string,
        alternative: formData.get("alternative") as string,
        category: formData.get("category") as string,
    };

    try {
        const validatedData = submissionSchema.parse(rawData);

        // TODO: In a real app, save validatedData to the database here
        console.log("New submission received:", validatedData);

        // Simulate a small delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return {
            success: true,
            message: "Thank you! Your submission has been received and is pending review.",
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
