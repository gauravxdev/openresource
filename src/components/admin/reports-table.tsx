"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { updateReportStatus } from "@/actions/admin/reports";
import { toast } from "sonner";

const REPORT_TYPE_LABELS: Record<string, string> = {
  BROKEN_LINK: "Broken Link",
  WRONG_CATEGORY: "Wrong Category",
  WRONG_TAGS: "Wrong Tags",
  OUTDATED: "Outdated",
  OTHER: "Other",
};

interface Report {
  id: string;
  email: string | null;
  resourceId: string;
  type: string;
  message: string | null;
  status: string;
  createdAt: Date;
  resource: {
    id: string;
    name: string;
    slug: string;
  };
}

export function ReportsTable({ reports }: { reports: Report[] }) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);

  const handleStatusUpdate = async (
    id: string,
    status: "RESOLVED" | "DISMISSED",
  ) => {
    setUpdatingId(id);
    const result = await updateReportStatus(id, status);
    setUpdatingId(null);

    if (result.success) {
      toast.success(`Report marked as ${status.toLowerCase()}`);
    } else {
      toast.error(result.error ?? "Failed to update report");
    }
  };

  return (
    <>
      <div className="bg-card/30 rounded-md border-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resource</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">
                  <a
                    href={`/resource/${report.resource.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {report.resource.name}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {REPORT_TYPE_LABELS[report.type] ?? report.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {report.email ?? "—"}
                </TableCell>
                <TableCell>
                  {report.message ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewingReport(report)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="sr-only">View message</span>
                    </Button>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      report.status === "PENDING"
                        ? "secondary"
                        : report.status === "RESOLVED"
                          ? "default"
                          : "outline"
                    }
                  >
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                  {formatDistanceToNow(new Date(report.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {report.status === "PENDING" ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusUpdate(report.id, "RESOLVED")
                          }
                          disabled={updatingId === report.id}
                        >
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          Mark Resolved
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusUpdate(report.id, "DISMISSED")
                          }
                          disabled={updatingId === report.id}
                        >
                          <XCircle className="mr-2 h-4 w-4 text-neutral-500" />
                          Dismiss
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      {report.status}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {reports.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-10 text-center"
                >
                  No reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {viewingReport && (
        <Dialog
          open={!!viewingReport}
          onOpenChange={(open) => !open && setViewingReport(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
              <DialogDescription>
                Issue with &quot;{viewingReport.resource.name}&quot;
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Email
                </span>
                <p className="text-sm">
                  {viewingReport.email ?? "Not provided"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Issue Type
                </span>
                <p className="text-sm">
                  {REPORT_TYPE_LABELS[viewingReport.type] ?? viewingReport.type}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Message
                </span>
                <p className="bg-muted rounded-md p-3 text-sm whitespace-pre-wrap">
                  {viewingReport.message ?? "No message provided"}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
