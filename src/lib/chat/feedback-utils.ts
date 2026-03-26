/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

/**
 * Extract tool names from message parts
 */
export function extractToolNames(parts: any[]): string[] {
  if (!parts || !Array.isArray(parts)) return [];

  return parts
    .filter((part) => {
      const partType = part?.type;
      return (
        partType === "dynamic-tool" ||
        (typeof partType === "string" && partType.startsWith("tool-"))
      );
    })
    .map((part) => {
      if (part.type === "dynamic-tool") {
        return part.toolName || "unknown";
      }
      // Extract tool name from "tool-searchResources" format
      return part.type.replace("tool-", "");
    })
    .filter((name) => name && name !== "unknown");
}

/**
 * Calculate satisfaction rate percentage
 */
export function calculateSatisfactionRate(
  goodCount: number,
  badCount: number,
): number {
  const total = goodCount + badCount;
  if (total === 0) return 0;
  return Math.round((goodCount / total) * 100);
}

/**
 * Format message preview from parts
 */
export function formatMessagePreview(parts: any[], maxLength = 100): string {
  if (!parts || !Array.isArray(parts)) return "No content";

  const textPart = parts.find((part) => part?.type === "text");
  if (!textPart) return "No text content";

  const text = (textPart as any).text || "";
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
}

/**
 * Get tool display name
 */
export function getToolDisplayName(toolName: string): string {
  const displayNames: Record<string, string> = {
    searchResources: "Search Resources",
    getCategories: "Get Categories",
    getTags: "Get Tags",
    getResourceDetails: "Resource Details",
    getResourcesByCategory: "Resources by Category",
    getResourcesByTag: "Resources by Tag",
    getUserBookmarks: "User Bookmarks",
    getGitHubRepoDeepDive: "GitHub Deep Dive",
    compareResources: "Compare Resources",
    recommendResources: "Recommend Resources",
    getTotalCount: "Total Count",
    exaSearch: "Exa Search",
    tavilySearch: "Tavily Search",
    serperSearch: "Serper Search",
  };

  return displayNames[toolName] || toolName;
}
