"use client";

import { FileText, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RecentFeedback } from "@/actions/admin/feedback-stats";

interface RecentFeedbackTableProps {
  data: RecentFeedback[];
}

export function RecentFeedbackTable({ data }: RecentFeedbackTableProps) {
  if (data.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="text-muted-foreground mb-4 flex items-center gap-2 text-sm font-medium">
          <FileText className="size-4" />
          <span>Recent Feedback</span>
        </div>
        <div className="text-muted-foreground flex h-32 items-center justify-center">
          No feedback data available yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border">
      <div className="p-6">
        <div className="text-muted-foreground mb-4 flex items-center gap-2 text-sm font-medium">
          <FileText className="size-4" />
          <span>Recent Feedback (Last 50)</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-t border-b">
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Type
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Message Preview
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Tool
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                User
              </th>
              <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((feedback) => (
              <tr key={feedback.id} className="hover:bg-muted/30">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={
                      feedback.type === "good" ? "default" : "destructive"
                    }
                    className="flex items-center gap-1"
                  >
                    {feedback.type === "good" ? (
                      <ThumbsUp className="size-3" />
                    ) : (
                      <ThumbsDown className="size-3" />
                    )}
                    {feedback.type}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-md truncate text-sm">
                    {feedback.messagePreview}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium">
                    {feedback.toolDisplayName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-muted-foreground text-sm">
                    {feedback.userName || "Anonymous"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-muted-foreground text-sm">
                    {feedback.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
