/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { tool } from "ai";
import { z } from "zod";
import Exa from "exa-js";
import { tavily } from "@tavily/core";

// ─────────────────────────────────────────────────────────────────────────────
// Exa Search Tool
// ─────────────────────────────────────────────────────────────────────────────

const exaParameters = z.object({
  query: z
    .string()
    .min(1)
    .describe(
      "The search query to execute on Exa. You MUST always provide this parameter.",
    ),
  type: z
    .enum(["auto", "keyword", "neural"])
    .default("auto")
    .describe("The type of search algorithm to use. 'auto' is usually best."),
});

export const exaSearch = tool({
  description:
    "Semantic/neural search for finding conceptually similar content. USE ONLY when: searching for companies/products by description, finding research papers, or when keyword search fails. For most queries, use serperSearch instead. IMPORTANT: You MUST provide the 'query' parameter as a string.",
  parameters: exaParameters,
  execute: async (args: z.infer<typeof exaParameters>) => {
    try {
      // Handle nested query objects from malformed tool calls
      let actualQuery = args.query;
      if (typeof actualQuery === "object" && actualQuery !== null) {
        actualQuery = (actualQuery as any).query;
      }

      if (
        !actualQuery ||
        typeof actualQuery !== "string" ||
        actualQuery.trim() === ""
      ) {
        // Return a descriptive error so the model can retry with proper args
        return {
          error:
            "Tool call failed: the 'query' parameter was empty or missing. Please call this tool again with a non-empty 'query' string.",
        };
      }

      const exa = new Exa(process.env.EXA_API_KEY ?? "");
      const result = await exa.searchAndContents(actualQuery, {
        type: args.type,
        contents: {
          text: { maxCharacters: 4000 },
        },
      });
      return result.results.map((r) => ({
        title: r.title,
        url: r.url,
        text: (r as any).text,
      }));
    } catch (error) {
      console.error("Error executing Exa search:", error);
      return { error: "Failed to fetch search results from Exa." };
    }
  },
} as any);

// ─────────────────────────────────────────────────────────────────────────────
// Tavily Search Tool
// ─────────────────────────────────────────────────────────────────────────────

const tavilyParameters = z.object({
  query: z
    .string()
    .min(1)
    .describe(
      "The search query to execute on Tavily. You MUST always provide this parameter.",
    ),
});

export const tavilySearch = tool({
  description:
    "AI-optimized search that returns a direct answer. USE ONLY when: you need a quick summarized answer, or for breaking news/very recent events. For general searches, use serperSearch instead. IMPORTANT: You MUST provide the 'query' parameter as a string.",
  parameters: tavilyParameters,
  execute: async (args: z.infer<typeof tavilyParameters>) => {
    try {
      let actualQuery = args.query;
      if (typeof actualQuery === "object" && actualQuery !== null) {
        actualQuery = (actualQuery as any).query;
      }

      if (
        !actualQuery ||
        typeof actualQuery !== "string" ||
        actualQuery.trim() === ""
      ) {
        return {
          error:
            "Tool call failed: the 'query' parameter was empty or missing. Please call this tool again with a non-empty 'query' string.",
        };
      }

      const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY ?? "" });
      const result = await tvly.search(actualQuery, {
        searchDepth: "basic",
        includeAnswer: true,
      });
      return {
        answer: result.answer,
        results: result.results.map((r) => ({
          title: r.title,
          url: r.url,
          content: r.content,
        })),
      };
    } catch (error) {
      console.error("Error executing Tavily search:", error);
      return { error: "Failed to fetch search results from Tavily." };
    }
  },
} as any);

// ─────────────────────────────────────────────────────────────────────────────
// Serper (Google) Search Tool
// ─────────────────────────────────────────────────────────────────────────────

const serperParameters = z.object({
  query: z
    .string()
    .min(1)
    .describe(
      "The search query to execute on Google. You MUST always provide this parameter.",
    ),
});

export const serperSearch = tool({
  description:
    "DEFAULT search tool - Google search for general purpose queries. Use this for: facts, definitions, how-to, products, news, latest info, any general question. This should be your FIRST choice for any search. IMPORTANT: You MUST provide the 'query' parameter as a string.",
  parameters: serperParameters,
  execute: async (args: z.infer<typeof serperParameters>) => {
    try {
      let actualQuery = args.query;
      if (typeof actualQuery === "object" && actualQuery !== null) {
        actualQuery = (actualQuery as any).query;
      }

      if (
        !actualQuery ||
        typeof actualQuery !== "string" ||
        actualQuery.trim() === ""
      ) {
        return {
          error:
            "Tool call failed: the 'query' parameter was empty or missing. Please call this tool again with a non-empty 'query' string.",
        };
      }

      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY ?? "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: actualQuery,
        }),
      });

      if (!response.ok) {
        console.error(
          "Serper API error:",
          response.status,
          response.statusText,
        );
        return { error: "Failed to fetch search results from Serper." };
      }

      const data = (await response.json()) as {
        organic?: Array<{ title: string; link: string; snippet: string }>;
        knowledgeGraph?: any;
        answerBox?: any;
      };
      return {
        organic:
          data.organic
            ?.map((r) => ({
              title: r.title,
              link: r.link,
              snippet: r.snippet,
            }))
            .slice(0, 5) ?? [],
        knowledgeGraph: data.knowledgeGraph ?? null,
        answerBox: data.answerBox ?? null,
      };
    } catch (error) {
      console.error("Error executing Serper search:", error);
      return { error: "An error occurred while executing the search." };
    }
  },
} as any);

// ─────────────────────────────────────────────────────────────────────────────
// Database & Smart Tools
// ─────────────────────────────────────────────────────────────────────────────

export {
  searchResources,
  getCategories,
  getTags,
  getResourceDetails,
  getResourcesByCategory,
  getResourcesByTag,
  getUserBookmarks,
  getGitHubRepoDeepDive,
  compareResources,
  recommendResources,
  getTotalCount,
  searchUsers,
  getUserDetails,
  updateUserRoleTool,
  updateUserStatusTool,
  searchResourcesAdmin,
  updateResourceStatusTool,
  updateResourceFieldsTool,
  getPendingResources,
  getDashboardStats,
  getUsageStats,
  getFeedbackStats,
  searchAuditLogs,
  getRecentActivity,
  searchChatsAdmin,
  deleteChatAdmin,
  getSystemHealth,
} from "./tools/index";
