"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { getRepoDetails } from "@/lib/github";

const submissionSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    shortDescription: z.string().min(10, "Short description must be at least 10 characters").optional(),
    description: z.string().min(10, "Description must be at least 10 characters"),
    websiteUrl: z.string().url("Please enter a valid Website URL"),
    repositoryUrl: z.string().url("Please enter a valid Repository URL"),
    categories: z.array(z.string()).min(1, "Please select at least one category").max(5, "You can select up to 5 categories"),
    alternative: z.string().optional(),
    image: z.string().url("Invalid image URL").optional().or(z.literal("")),
    logo: z.string().url("Invalid logo URL").optional().or(z.literal("")),
    // GitHub stats (optional, will be fetched if not provided)
    stars: z.coerce.number().optional(),
    forks: z.coerce.number().optional(),
    lastCommit: z.string().optional(),
    repositoryCreatedAt: z.string().optional(),
    license: z.string().optional(),
});

export type SubmissionResult = {
    success: boolean;
    message: string;
};

/**
 * Parses a GitHub URL to extract owner and repo.
 */
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    try {
        const parsed = new URL(url);
        if (!parsed.hostname.includes("github.com")) {
            return null;
        }
        const parts = parsed.pathname.split("/").filter(Boolean);
        if (parts.length < 2) {
            return null;
        }
        return { owner: parts[0]!, repo: parts[1]! };
    } catch {
        return null;
    }
}

/**
 * Generates a URL-friendly slug from a string.
 */
function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w-]+/g, "") // Remove all non-word chars
        .replace(/--+/g, "-") // Replace multiple - with single -
        .replace(/^-+/, "") // Trim - from start of text
        .replace(/-+$/, ""); // Trim - from end of text
}

/**
 * Ensures a slug is unique by appending a suffix if necessary.
 */
async function getUniqueSlug(name: string): Promise<string> {
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await db.resource.findUnique({
            where: { slug },
        });

        if (!existing) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}

export async function submitResource(formData: FormData): Promise<SubmissionResult> {
    const get = (key: string) => {
        const value = formData.get(key);
        return (value && value !== "") ? (value as string) : undefined;
    };

    const rawData = {
        name: get("name"),
        shortDescription: get("shortDescription"),
        description: get("description"),
        websiteUrl: get("websiteUrl"),
        repositoryUrl: get("repositoryUrl"),
        categories: formData.get("categories")
            ? JSON.parse(formData.get("categories") as string)
            : [],
        alternative: get("alternative"),
        image: get("image"),
        logo: get("logo"),
        stars: get("stars"),
        forks: get("forks"),
        lastCommit: get("lastCommit"),
        repositoryCreatedAt: get("repositoryCreatedAt"),
        license: get("license"),
    };

    try {
        const validatedData = submissionSchema.parse(rawData);

        // Generate unique slug
        const slug = await getUniqueSlug(validatedData.name);

        // If GitHub stats are not provided, fetch them
        let stars = validatedData.stars ?? 0;
        let forks = validatedData.forks ?? 0;
        let lastCommit: Date | null = validatedData.lastCommit ? new Date(validatedData.lastCommit) : null;
        let repositoryCreatedAt: Date | null = validatedData.repositoryCreatedAt ? new Date(validatedData.repositoryCreatedAt) : null;
        let license = validatedData.license ?? null;

        if (!validatedData.stars || !validatedData.forks) {
            const parsed = parseGitHubUrl(validatedData.repositoryUrl);
            if (parsed) {
                try {
                    const repoDetails = await getRepoDetails(parsed.owner, parsed.repo);
                    if (repoDetails) {
                        stars = repoDetails.stargazers_count;
                        forks = repoDetails.forks_count;
                        lastCommit = repoDetails.updated_at ? new Date(repoDetails.updated_at) : null;
                        repositoryCreatedAt = repoDetails.created_at ? new Date(repoDetails.created_at) : null;
                        license = repoDetails.license?.spdx_id ?? repoDetails.license?.name ?? null;
                    }
                } catch (err) {
                    console.warn("[Submission] Failed to fetch GitHub stats:", err);
                }
            }
        }

        await db.resource.create({
            data: {
                slug,
                name: validatedData.name,
                shortDescription: validatedData.shortDescription ?? null,
                description: validatedData.description,
                websiteUrl: validatedData.websiteUrl,
                repositoryUrl: validatedData.repositoryUrl,
                alternative: validatedData.alternative ?? null,
                image: validatedData.image ?? null,
                logo: validatedData.logo ?? null,
                stars,
                forks,
                lastCommit,
                repositoryCreatedAt,
                license,
                status: "APPROVED", // Since this is the admin submit page
                addedBy: "ADMIN",
                categories: {
                    connectOrCreate: validatedData.categories.map((cat) => ({
                        where: { name: cat },
                        create: {
                            name: cat,
                            slug: slugify(cat),
                        },
                    })),
                },
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

export async function getCategories() {
    try {
        const categories = await db.category.findMany({
            select: { name: true },
            orderBy: { name: 'asc' }
        });
        return categories.map(c => ({ value: c.name, label: c.name }));
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}
