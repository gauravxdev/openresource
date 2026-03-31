/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Trash2, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { deleteCategory, updateCategoryStatus } from "@/actions/categories";
import { toast } from "sonner";

export function CategoriesTable({ categories }: { categories: any[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [rejectingCategory, setRejectingCategory] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    setIsDeleting(id);
    const result = await deleteCategory(id);
    setIsDeleting(null);

    if (result.success) {
      toast.success("Category deleted successfully");
    } else {
      toast.error(result.message ?? "Failed to delete category");
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: "PENDING" | "APPROVED" | "REJECTED",
    reason?: string,
  ) => {
    setIsUpdatingStatus(id);
    const result = await updateCategoryStatus(id, status, reason);
    setIsUpdatingStatus(null);

    if (result.success) {
      toast.success(result.message);
      setRejectingCategory(null);
      setRejectionReason("");
    } else {
      toast.error(result.message ?? "Failed to update category status");
    }
  };

  return (
    <div className="bg-card/30 rounded-md border-none">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Submitted By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Resources</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories?.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">
                <span>{category.name}</span>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground text-sm">
                  {category.slug}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {category.user?.name ?? "Admin / Unknown"}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {category.addedBy === "ADMIN"
                      ? "Admin created"
                      : "User suggested"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    category.status === "APPROVED"
                      ? "default"
                      : category.status === "PENDING"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {category.status}
                </Badge>
                {category.status === "REJECTED" && category.rejectionReason && (
                  <span
                    className="text-destructive mt-1 line-clamp-1 block text-xs"
                    title={category.rejectionReason}
                  >
                    {category.rejectionReason}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {category._count?.resources ?? 0}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(category.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
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
                        handleStatusUpdate(category.id, "APPROVED")
                      }
                      disabled={
                        isUpdatingStatus === category.id ||
                        category.status === "APPROVED"
                      }
                    >
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      <span className="text-green-600">Approve</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setRejectingCategory(category)}
                      disabled={
                        isUpdatingStatus === category.id ||
                        category.status === "REJECTED"
                      }
                    >
                      <XCircle className="mr-2 h-4 w-4 text-red-600" />
                      <span className="text-red-600">Reject with Reason</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      disabled={isDeleting === category.id}
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting === category.id ? "Deleting..." : "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {(!categories || categories.length === 0) && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-muted-foreground py-10 text-center"
              >
                No categories found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Reject Dialog */}
      <Dialog
        open={!!rejectingCategory}
        onOpenChange={(open) => {
          if (!open) {
            setRejectingCategory(null);
            setRejectionReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Category</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting &quot;{rejectingCategory?.name}
              &quot;. The submitter will be able to see this reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Input
                id="rejectionReason"
                placeholder="e.g. Category already exists under a different name..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectingCategory(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                rejectingCategory &&
                handleStatusUpdate(
                  rejectingCategory.id,
                  "REJECTED",
                  rejectionReason || "No reason provided",
                )
              }
              disabled={!rejectionReason.trim()}
            >
              Reject Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
