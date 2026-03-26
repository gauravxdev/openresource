export const dynamic = "force-dynamic";

import {
  getFeedbackByTool,
  getFeedbackOverTime,
  getRecentFeedback,
  getFeedbackSummary,
} from "@/actions/admin/feedback-stats";
import { FeedbackSummaryCards } from "@/components/admin/feedback-summary-cards";
import { FeedbackByToolChart } from "@/components/admin/feedback-by-tool-chart";
import { FeedbackOverTimeChart } from "@/components/admin/feedback-over-time-chart";
import { RecentFeedbackTable } from "@/components/admin/feedback-table";

export default async function FeedbackAnalyticsPage() {
  const [feedbackByTool, feedbackOverTime, recentFeedback, summary] =
    await Promise.all([
      getFeedbackByTool(),
      getFeedbackOverTime(),
      getRecentFeedback(),
      getFeedbackSummary(),
    ]);

  return (
    <main className="bg-background w-full flex-1 space-y-8 overflow-auto p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Feedback Analytics
        </h1>
        <p className="text-muted-foreground">
          Monitor AI response quality and identify failing tools.
        </p>
      </div>

      {/* Summary Cards */}
      <FeedbackSummaryCards summary={summary} />

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FeedbackByToolChart data={feedbackByTool} />
        <FeedbackOverTimeChart data={feedbackOverTime} />
      </div>

      {/* Recent Feedback Table */}
      <RecentFeedbackTable data={recentFeedback} />
    </main>
  );
}
