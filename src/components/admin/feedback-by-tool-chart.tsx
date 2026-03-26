"use client";

import { BarChart3 } from "lucide-react";
import type { FeedbackByTool } from "@/actions/admin/feedback-stats";

interface FeedbackByToolChartProps {
  data: FeedbackByTool[];
}

export function FeedbackByToolChart({ data }: FeedbackByToolChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="text-muted-foreground mb-4 flex items-center gap-2 text-sm font-medium">
          <BarChart3 className="size-4" />
          <span>Feedback by Tool</span>
        </div>
        <div className="text-muted-foreground flex h-64 items-center justify-center">
          No feedback data available yet
        </div>
      </div>
    );
  }

  // Find max count for scaling
  const maxCount = Math.max(...data.map((d) => d.totalCount));

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="text-muted-foreground mb-4 flex items-center gap-2 text-sm font-medium">
        <BarChart3 className="size-4" />
        <span>Feedback by Tool</span>
      </div>
      <div className="space-y-3">
        {data.slice(0, 8).map((tool) => (
          <div key={tool.toolName} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{tool.toolDisplayName}</span>
              <span className="text-muted-foreground">
                {tool.satisfactionRate}% ({tool.totalCount})
              </span>
            </div>
            <div className="flex h-4 w-full gap-0.5 overflow-hidden rounded-full bg-gray-100">
              {/* Good feedback bar */}
              <div
                className="h-full bg-green-500 transition-all"
                style={{
                  width: `${(tool.goodCount / maxCount) * 100}%`,
                }}
              />
              {/* Bad feedback bar */}
              <div
                className="h-full bg-red-500 transition-all"
                style={{
                  width: `${(tool.badCount / maxCount) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="text-muted-foreground mt-4 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="size-3 rounded bg-green-500" />
          <span>Good</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-3 rounded bg-red-500" />
          <span>Bad</span>
        </div>
      </div>
    </div>
  );
}
