export { searchResources } from "./search";
export { getCategories, getTags } from "./taxonomy";
export { getResourceDetails } from "./details";
export { getResourcesByCategory, getResourcesByTag } from "./filters";
export { getUserBookmarks } from "./bookmarks";
export { getGitHubRepoDeepDive } from "./github";
export { compareResources } from "./compare";
export { recommendResources } from "./recommend";
export { getTotalCount } from "./count";

// Admin tools (only used when userRole === "admin")
export {
  searchUsers,
  getUserDetails,
  updateUserRoleTool,
  updateUserStatusTool,
  searchResourcesAdmin,
  updateResourceStatusTool,
  updateResourceFieldsTool,
  getDashboardStats,
  getUsageStats,
  getFeedbackStats,
  searchAuditLogs,
  getRecentActivity,
  searchChatsAdmin,
  deleteChatAdmin,
  getSystemHealth,
} from "./admin/index";
