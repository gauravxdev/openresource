"use server";
import { z } from "zod";
import { db } from "@/server/db";
import { getRepoDetails } from "@/lib/github";
import { logAudit } from "@/lib/audit";
const submissionSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    shortDescription: z.string().min(10, "Short description must be at least 10 characters").optional(),
    oneLiner: z.string().max(100, "One-liner must be 100 characters or less").optional(),
    description: z.string().min(10, "Description must be at least 10 characters"),
    websiteUrl: z.string().url("Please enter a valid Website URL").optional().or(z.literal("")),
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
/**
 * Parses a GitHub URL to extract owner and repo.
 */
function parseGitHubUrl(url) {
    try {
        const parsed = new URL(url);
        if (!parsed.hostname.includes("github.com")) {
            return null;
        }
        const parts = parsed.pathname.split("/").filter(Boolean);
        if (parts.length < 2) {
            return null;
        }
        return { owner: parts[0], repo: parts[1] };
    }
    catch {
        return null;
    }
}
/**
 * Generates a URL-friendly slug from a string.
 */
function slugify(text) {
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
async function getUniqueSlug(name) {
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
export async function submitResource(formData) {
    const get = (key) => {
        const value = formData.get(key);
        return (value && value !== "") ? value : undefined;
    };
    const rawData = {
        id: get("id"),
        name: get("name"),
        shortDescription: get("shortDescription"),
        oneLiner: get("oneLiner"),
        description: get("description"),
        websiteUrl: get("websiteUrl"),
        repositoryUrl: get("repositoryUrl"),
        categories: formData.get("categories")
            ? JSON.parse(formData.get("categories"))
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
        // Check if github-repo is in the categories
        // Normalize category names by replacing spaces with hyphens for comparison
        const isGitHubRepo = validatedData.categories.some(cat => {
            const normalized = cat.toLowerCase().replace(/\s+/g, "-");
            return normalized === "github-repo" || normalized === "github-repos";
        });
        // Validate logo requirement: required for all except github-repo
        if (!isGitHubRepo && !validatedData.logo) {
            return {
                success: false,
                message: "Logo is required for non-GitHub repository resources",
            };
        }
        // Prepare GitHub stats with fallback fetching if necessary
        let stats = {
            stars: validatedData.stars,
            forks: validatedData.forks,
            lastCommit: validatedData.lastCommit,
            repositoryCreatedAt: validatedData.repositoryCreatedAt,
            license: validatedData.license,
        };
        if (isGitHubRepo && (stats.stars === undefined || stats.forks === undefined)) {
            const githubInfo = parseGitHubUrl(validatedData.repositoryUrl);
            if (githubInfo) {
                try {
                    const details = await getRepoDetails(githubInfo.owner, githubInfo.repo);
                    if (details) {
                        stats = {
                            stars: details.stargazers_count,
                            forks: details.forks_count,
                            lastCommit: details.updated_at ?? undefined,
                            repositoryCreatedAt: details.created_at ?? undefined,
                            license: details.license?.spdx_id ?? details.license?.name ?? undefined,
                        };
                    }
                }
                catch (e) {
                    console.error("Failed to fetch GitHub stats during submission:", e);
                }
            }
        }
        let resource;
        if (validatedData.id) {
            // Update existing resource
            resource = await db.resource.update({
                where: { id: validatedData.id },
                data: {
                    name: validatedData.name,
                    shortDescription: validatedData.shortDescription ?? null,
                    oneLiner: validatedData.oneLiner ?? null,
                    description: validatedData.description,
                    websiteUrl: validatedData.websiteUrl ?? null,
                    repositoryUrl: validatedData.repositoryUrl,
                    alternative: validatedData.alternative ?? null,
                    image: validatedData.image ?? null,
                    logo: validatedData.logo ?? null,
                    stars: stats.stars ?? undefined,
                    forks: stats.forks ?? undefined,
                    lastCommit: stats.lastCommit ?? null,
                    repositoryCreatedAt: stats.repositoryCreatedAt ?? null,
                    license: stats.license ?? null,
                    categories: {
                        set: [], // Disconnect old categories
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
        }
        else {
            // Create new resource
            // Generate unique slug only for new resource
            const slug = await getUniqueSlug(validatedData.name);
            resource = await db.resource.create({
                data: {
                    slug,
                    name: validatedData.name,
                    shortDescription: validatedData.shortDescription ?? null,
                    oneLiner: validatedData.oneLiner ?? null,
                    description: validatedData.description,
                    websiteUrl: validatedData.websiteUrl ?? null,
                    repositoryUrl: validatedData.repositoryUrl,
                    alternative: validatedData.alternative ?? null,
                    image: validatedData.image ?? null,
                    logo: validatedData.logo ?? null,
                    stars: stats.stars ?? undefined,
                    forks: stats.forks ?? undefined,
                    lastCommit: stats.lastCommit ?? null,
                    repositoryCreatedAt: stats.repositoryCreatedAt ?? null,
                    license: stats.license ?? null,
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
        }
        await logAudit({
            action: validatedData.id ? "UPDATE_RESOURCE" : "SUBMIT_RESOURCE",
            resourceId: resource.id,
            details: { name: resource.name, slug: resource.slug }
        });
        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin/resources");
        revalidatePath("/home");
        revalidatePath("/github-repos");
        revalidatePath("/android-apps");
        revalidatePath(`/resource/${resource.slug}`);
        return {
            success: true,
            message: validatedData.id ? "Resource updated successfully!" : "Resource successfully added!",
        };
    }
    catch (error) {
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
    }
    catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}
