import { logAudit, type AuditAction } from "@/lib/audit";

export async function logAdminToolAudit(
  action: AuditAction,
  adminUserId: string,
  details?: Record<string, unknown>,
) {
  await logAudit({
    action,
    userId: adminUserId,
    details: {
      source: "admin-chat-tool",
      ...details,
    },
  });
}

export function requireAdmin(userRole: string): void {
  if (userRole !== "admin") {
    throw new Error(
      "Admin access required. This tool is restricted to admin users.",
    );
  }
}
