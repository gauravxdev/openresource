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
  | "UPDATE_USER_ROLE"
  | "UPDATE_USER_STATUS"
  | "ADMIN_CHAT_TOOL"
  | "ADMIN_SEARCH_USERS"
  | "ADMIN_VIEW_USER_DETAILS"
  | "ADMIN_UPDATE_USER_ROLE"
  | "ADMIN_UPDATE_USER_STATUS"
  | "ADMIN_SEARCH_RESOURCES"
  | "ADMIN_UPDATE_RESOURCE_STATUS"
  | "ADMIN_UPDATE_RESOURCE_FIELDS"
  | "ADMIN_VIEW_DASHBOARD_STATS"
  | "ADMIN_VIEW_USAGE_STATS"
  | "ADMIN_VIEW_FEEDBACK_STATS"
  | "ADMIN_SEARCH_AUDIT_LOGS"
  | "ADMIN_VIEW_RECENT_ACTIVITY"
  | "ADMIN_SEARCH_CHATS"
  | "ADMIN_DELETE_CHAT"
  | "ADMIN_VIEW_SYSTEM_HEALTH";

interface CreateAuditLogParams {
  action: AuditAction;
  userId?: string;
  resourceId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;
}

export async function logAudit({
  action,
  userId,
  resourceId,
  details,
}: CreateAuditLogParams) {
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
