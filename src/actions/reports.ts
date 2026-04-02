"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const reportSchema = z
  .object({
    email: z.string().email("Valid email is required"),
    resourceId: z.string().min(1, "Resource ID is required"),
    type: z.enum(
      ["BROKEN_LINK", "WRONG_CATEGORY", "WRONG_TAGS", "OUTDATED", "OTHER"],
      {
        required_error: "Issue type is required",
      },
    ),
    message: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "OTHER" && (!data.message || !data.message.trim())) {
        return false;
      }
      return true;
    },
    {
      message: "Description is required when issue type is 'Other'",
      path: ["message"],
    },
  );

export async function submitReport(data: {
  email: string;
  resourceId: string;
  type: string;
  message?: string;
}) {
  try {
    const validated = reportSchema.parse(data);

    await db.report.create({
      data: {
        email: validated.email,
        resourceId: validated.resourceId,
        type: validated.type,
        message: validated.message?.trim() || null,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/reports");

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Validation failed",
      };
    }
    console.error("[Report] Submit Error:", error);
    return { success: false, error: "Failed to submit report" };
  }
}
