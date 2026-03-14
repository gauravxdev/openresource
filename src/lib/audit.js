import { db } from "@/server/db";
export async function logAudit({ action, userId, resourceId, details }) {
    try {
        await db.auditLog.create({
            data: {
                action,
                userId,
                resourceId,
                details: details ? JSON.parse(JSON.stringify(details)) : undefined, // Ensure it's valid JSON for Prisma
            },
        });
    }
    catch (error) {
        // We catch and log to console so an audit failure doesn't break the main business logic
        console.error("Failed to create audit log:", error);
    }
}
