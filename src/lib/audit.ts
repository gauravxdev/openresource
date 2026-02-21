import { db } from "@/server/db";

export type AuditAction =
    | "LOGIN"
    | "SUBMIT_RESOURCE"
    | "APPROVE_RESOURCE"
    | "REJECT_RESOURCE"
    | "DELETE_RESOURCE"
    | "UPDATE_RESOURCE"
    | "CREATE_CATEGORY"
    | "DELETE_CATEGORY"
    | "DELETE_USER"
    | "UPDATE_USER_ROLE";

interface CreateAuditLogParams {
    action: AuditAction;
    userId?: string;
    resourceId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details?: any;
}

export async function logAudit({ action, userId, resourceId, details }: CreateAuditLogParams) {
    try {
        await db.auditLog.create({
            data: {
                action,
                userId,
                resourceId,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                details: details ? JSON.parse(JSON.stringify(details)) : undefined, // Ensure it's valid JSON for Prisma
            },
        });
    } catch (error) {
        // We catch and log to console so an audit failure doesn't break the main business logic
        console.error("Failed to create audit log:", error);
    }
}
