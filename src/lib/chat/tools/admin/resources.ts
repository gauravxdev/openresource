/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { tool } from "ai";
import { z } from "zod";
import { db } from "@/server/db";
import { requireAdmin, logAdminToolAudit } from "./audit-helper";

// ─────────────────────────────────────────────────────────────────────────────
// searchResourcesAdmin
// ─────────────────────────────────────────────────────────────────────────────

const searchResourcesAdminParams = z.object({
  query: z.string().optional().describe("Search by name, slug, or description"),
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED", "ALL"])
    .default("ALL")
    .describe("Filter by resource status"),
  category: z.string().optional().describe("Filter by category name"),
  sortBy: z
    .enum(["newest", "oldest", "name-asc", "name-desc"])
    .default("newest")
    .describe("Sort order"),
  page: z.number().default(1).describe("Page number"),
  limit: z.number().default(20).describe("Results per page (max 50)"),
});

export function createSearchResourcesAdminTool(
  adminUserId: string,
  userRole: string,
) {
  return tool({
    description:
      "Search ALL resources (including pending/rejected) with filters. Admin version of search — shows all statuses, not just approved.",
    parameters: searchResourcesAdminParams,
    execute: async (args: z.infer<typeof searchResourcesAdminParams>) => {
      const { query, status, category, sortBy, page, limit } = args;
      requireAdmin(userRole);
      await logAdminToolAudit("ADMIN_SEARCH_RESOURCES", adminUserId, {
        query,
        status,
        category,
      });

      try {
        const cappedLimit = Math.min(limit, 50);
        const skip = (page - 1) * cappedLimit;

        const where: any = {};
        if (query) {
          where.OR = [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ];
        }
        if (status !== "ALL") where.status = status;
        if (category) {
          where.categories = { some: { name: category } };
        }

        let orderBy: any = { createdAt: "desc" };
        if (sortBy === "oldest") orderBy = { createdAt: "asc" };
        if (sortBy === "name-asc") orderBy = { name: "asc" };
        if (sortBy === "name-desc") orderBy = { name: "desc" };

        const [resources, total] = await Promise.all([
          db.resource.findMany({
            where,
            orderBy,
            skip,
            take: cappedLimit,
            include: {
              user: { select: { name: true, email: true, id: true } },
              categories: { select: { name: true, slug: true } },
              _count: { select: { bookmarks: true } },
            },
          }),
          db.resource.count({ where }),
        ]);

        return {
          total,
          page,
          totalPages: Math.ceil(total / cappedLimit),
          resources: resources.map((r) => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            status: r.status,
            description: r.description,
            shortDescription: r.shortDescription,
            oneLiner: r.oneLiner,
            websiteUrl: r.websiteUrl,
            repositoryUrl: r.repositoryUrl,
            stars: r.stars,
            forks: r.forks,
            license: r.license,
            tags: r.tags,
            categories: r.categories.map((c) => c.name),
            addedBy: r.user?.name ?? r.user?.email ?? "Unknown",
            addedByUserId: r.user?.id ?? null,
            bookmarks: r._count.bookmarks,
            rejectionReason: r.rejectionReason,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          })),
        };
      } catch (error) {
        console.error("[Admin Tool] searchResourcesAdmin error:", error);
        return { error: "Failed to search resources" };
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

// ─────────────────────────────────────────────────────────────────────────────
// updateResourceStatusTool
// ─────────────────────────────────────────────────────────────────────────────

const updateResourceStatusParams = z.object({
  resourceId: z.string().describe("The resource ID to update"),
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED"])
    .describe("The new status"),
  rejectionReason: z
    .string()
    .optional()
    .describe("Reason for rejection (only used when status is REJECTED)"),
});

export function createUpdateResourceStatusTool(
  adminUserId: string,
  userRole: string,
) {
  return tool({
    description:
      "Approve, reject, or set a resource to pending status. When rejecting, optionally provide a rejection reason.",
    parameters: updateResourceStatusParams,
    execute: async (args: z.infer<typeof updateResourceStatusParams>) => {
      const { resourceId, status, rejectionReason } = args;
      requireAdmin(userRole);
      await logAdminToolAudit("ADMIN_UPDATE_RESOURCE_STATUS", adminUserId, {
        resourceId,
        newStatus: status,
        rejectionReason,
      });

      try {
        const resource = await db.resource.findUnique({
          where: { id: resourceId },
          select: { id: true, name: true, slug: true, status: true },
        });

        if (!resource) {
          return { error: "Resource not found" };
        }

        const updateData: any = { status };
        if (status === "REJECTED" && rejectionReason) {
          updateData.rejectionReason = rejectionReason;
        } else if (status !== "REJECTED") {
          updateData.rejectionReason = null;
        }

        await db.resource.update({
          where: { id: resourceId },
          data: updateData,
        });

        return {
          success: true,
          message: `Resource "${resource.name}" (${resource.slug}) status changed from '${resource.status}' to '${status}'${rejectionReason ? ` — Reason: ${rejectionReason}` : ""}`,
          resource: {
            id: resource.id,
            name: resource.name,
            slug: resource.slug,
            previousStatus: resource.status,
            newStatus: status,
          },
        };
      } catch (error) {
        console.error("[Admin Tool] updateResourceStatus error:", error);
        return { error: "Failed to update resource status" };
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

// ─────────────────────────────────────────────────────────────────────────────
// updateResourceFieldsTool
// ─────────────────────────────────────────────────────────────────────────────

const updateResourceFieldsParams = z.object({
  resourceId: z.string().describe("The resource ID to update"),
  name: z.string().optional().describe("New resource name"),
  shortDescription: z.string().optional().describe("New short description"),
  oneLiner: z.string().optional().describe("New one-liner tagline"),
  websiteUrl: z.string().optional().describe("New website URL"),
  repositoryUrl: z.string().optional().describe("New repository URL"),
  tags: z.array(z.string()).optional().describe("New tags array"),
  license: z.string().optional().describe("New license"),
});

export function createUpdateResourceFieldsTool(
  adminUserId: string,
  userRole: string,
) {
  return tool({
    description:
      "Edit resource fields like name, description, shortDescription, oneLiner, websiteUrl, repositoryUrl, tags, or license. Only provide fields you want to change.",
    parameters: updateResourceFieldsParams,
    execute: async (args: z.infer<typeof updateResourceFieldsParams>) => {
      const {
        resourceId,
        name,
        shortDescription,
        oneLiner,
        websiteUrl,
        repositoryUrl,
        tags,
        license,
      } = args;
      requireAdmin(userRole);

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (shortDescription !== undefined)
        updateData.shortDescription = shortDescription;
      if (oneLiner !== undefined) updateData.oneLiner = oneLiner;
      if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl;
      if (repositoryUrl !== undefined) updateData.repositoryUrl = repositoryUrl;
      if (tags !== undefined) updateData.tags = tags;
      if (license !== undefined) updateData.license = license;

      if (Object.keys(updateData).length === 0) {
        return { error: "No fields provided to update" };
      }

      await logAdminToolAudit("ADMIN_UPDATE_RESOURCE_FIELDS", adminUserId, {
        resourceId,
        fields: Object.keys(updateData),
      });

      try {
        const resource = await db.resource.findUnique({
          where: { id: resourceId },
          select: { id: true, name: true, slug: true },
        });

        if (!resource) {
          return { error: "Resource not found" };
        }

        await db.resource.update({
          where: { id: resourceId },
          data: updateData,
        });

        return {
          success: true,
          message: `Resource "${resource.name}" (${resource.slug}) updated. Fields changed: ${Object.keys(updateData).join(", ")}`,
          updatedFields: Object.keys(updateData),
        };
      } catch (error) {
        console.error("[Admin Tool] updateResourceFields error:", error);
        return { error: "Failed to update resource fields" };
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

// ─────────────────────────────────────────────────────────────────────────────
// getPendingResources
// ─────────────────────────────────────────────────────────────────────────────

export function createGetPendingResourcesTool(
  adminUserId: string,
  userRole: string,
) {
  return tool({
    description:
      "Get all pending resources with full details for review. Use this when admin asks to see pending submissions, review queue, or wants to approve/reject resources. Returns full description, URLs, who submitted it, and submission date.",
    parameters: z.object({
      limit: z
        .number()
        .default(10)
        .describe("Number of pending resources to return (max 50)"),
    }),
    execute: async (
      args: z.infer<z.ZodObject<{ limit: z.ZodDefault<z.ZodNumber> }>>,
    ) => {
      const { limit } = args;
      requireAdmin(userRole);
      await logAdminToolAudit("ADMIN_SEARCH_RESOURCES", adminUserId, {
        status: "PENDING",
        source: "getPendingResources",
      });

      try {
        const cappedLimit = Math.min(limit, 50);
        const total = await db.resource.count({ where: { status: "PENDING" } });

        if (total === 0) {
          return {
            total: 0,
            message: "No pending resources. The review queue is empty!",
            resources: [],
          };
        }

        const resources = await db.resource.findMany({
          where: { status: "PENDING" },
          orderBy: { createdAt: "asc" },
          take: cappedLimit,
          include: {
            user: { select: { name: true, email: true, id: true } },
            categories: { select: { name: true, slug: true } },
          },
        });

        return {
          total,
          showing: resources.length,
          message: `Found ${total} pending resource(s). Showing ${resources.length}.`,
          resources: resources.map((r) => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            fullDescription: r.description,
            shortDescription: r.shortDescription,
            oneLiner: r.oneLiner,
            websiteUrl: r.websiteUrl,
            repositoryUrl: r.repositoryUrl,
            tags: r.tags,
            categories: r.categories.map((c) => c.name),
            license: r.license,
            submittedBy: r.user?.name ?? r.user?.email ?? "Unknown",
            submittedByUserId: r.user?.id ?? null,
            submittedAt: r.createdAt,
            waitingFor: `${Math.floor((Date.now() - r.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days`,
          })),
        };
      } catch (error) {
        console.error("[Admin Tool] getPendingResources error:", error);
        return { error: "Failed to get pending resources" };
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}
