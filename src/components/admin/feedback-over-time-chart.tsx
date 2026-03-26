"use client";

import { TrendingUp } from "lucide-react";
import type { FeedbackOverTime } from "@/actions/admin/feedback-stats";

interface FeedbackOverTimeChartProps {
  data: FeedbackOverTime[];
}

export function FeedbackOverTimeChart({ data }: FeedbackOverTimeChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="text-muted-foreground mb-4 flex items-center gap-2 text-sm font-medium">
          <TrendingUp className="size-4" />
          <span>Feedback Over Time (30 days)</span>
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
        <TrendingUp className="size-4" />
        <span>Feedback Over Time (30 days)</span>
      </div>
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="text-muted-foreground absolute top-0 left-0 flex h-full flex-col justify-between text-xs">
          <span>{maxCount}</span>
          <span>{Math.round(maxCount / 2)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="ml-8 h-full">
          <div className="flex h-full items-end gap-1">
            {data.map((day) => {
              const goodHeight =
                maxCount > 0 ? (day.goodCount / maxCount) * 100 : 0;
              const badHeight =
                maxCount > 0 ? (day.badCount / maxCount) * 100 : 0;

              return (
                <div
                  key={day.date}
                  className="group relative flex flex-1 flex-col items-center"
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block">
                    <div className="rounded bg-gray-900 px-2 py-1 text-xs text-white">
                      <div>{day.date}</div>
                      <div className="text-green-400">
                        Good: {day.goodCount}
                      </div>
                      <div className="text-red-400">Bad: {day.badCount}</div>
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="flex w-full flex-col-reverse">
                    <div
                      className="w-full bg-green-500 transition-all"
                      style={{ height: `${goodHeight}%` }}
                    />
                    <div
                      className="w-full bg-red-500 transition-all"
                      style={{ height: `${badHeight}%` }}
                    />
                  </div>

                  {/* Date label (show every 5th) */}
                  {data.indexOf(day) % 5 === 0 && (
                    <span className="text-muted-foreground mt-1 text-[10px]">
                      {day.date.split("-")[2]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
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
