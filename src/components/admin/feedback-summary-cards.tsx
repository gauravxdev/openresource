import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Award,
  AlertTriangle,
} from "lucide-react";
import type { FeedbackSummary } from "@/actions/admin/feedback-stats";

interface FeedbackSummaryCardsProps {
  summary: FeedbackSummary;
}

export function FeedbackSummaryCards({ summary }: FeedbackSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Feedback */}
      <div className="bg-card rounded-lg border p-6">
        <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="size-4" />
          <span>Total Feedback</span>
        </div>
        <p className="text-3xl font-bold">
          {summary.totalFeedback.toLocaleString()}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          {summary.goodFeedback} good, {summary.badFeedback} bad
        </p>
      </div>

      {/* Overall Satisfaction Rate */}
      <div className="bg-card rounded-lg border p-6">
        <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
          <TrendingUp className="size-4" />
          <span>Satisfaction Rate</span>
        </div>
        <p className="text-3xl font-bold">{summary.overallSatisfactionRate}%</p>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-green-500"
            style={{ width: `${summary.overallSatisfactionRate}%` }}
          />
        </div>
      </div>

      {/* Best Performing Tool */}
      <div className="bg-card rounded-lg border p-6">
        <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
          <Award className="size-4" />
          <span>Best Tool</span>
        </div>
        {summary.bestTool ? (
          <>
            <p className="text-lg font-bold">{summary.bestTool}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {summary.bestToolRate}% satisfaction
            </p>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">No data yet</p>
        )}
      </div>

      {/* Worst Performing Tool */}
      <div className="bg-card rounded-lg border p-6">
        <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="size-4" />
          <span>Needs Improvement</span>
        </div>
        {summary.worstTool ? (
          <>
            <p className="text-lg font-bold">{summary.worstTool}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {summary.worstToolRate}% satisfaction
            </p>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">No data yet</p>
        )}
      </div>
    </div>
  );
}
