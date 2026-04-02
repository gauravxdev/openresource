"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function getAdminReports(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const skip = (page - 1) * limit;
  const status = params?.status;

  try {
    const where: Record<string, unknown> = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      db.report.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          resource: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      db.report.count({ where }),
    ]);

    return {
      success: true,
      data: reports,
      metadata: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[Admin Reports] Get Error:", error);
    return {
      success: false,
      data: [],
      metadata: { total: 0, page: 1, totalPages: 1 },
      error: "Failed to fetch reports",
    };
  }
}

export async function updateReportStatus(
  id: string,
  status: "RESOLVED" | "DISMISSED",
) {
  try {
    await db.report.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/reports");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[Admin Reports] Update Status Error:", error);
    return { success: false, error: "Failed to update report status" };
  }
}
