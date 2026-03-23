/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateAdminResourceStatus } from "@/actions/admin/resources";
import { toast } from "sonner";

interface RejectResourceDialogProps {
  resource: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RejectResourceDialog({
  resource,
  open,
  onOpenChange,
  onSuccess,
}: RejectResourceDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setIsSubmitting(true);
    const result = await updateAdminResourceStatus(
      resource.id,
      "REJECTED",
      reason.trim(),
    );
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Resource rejected with reason");
      setReason("");
      onOpenChange(false);
      onSuccess?.();
    } else {
      toast.error(result.error ?? "Failed to reject resource");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Resource</DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting &quot;{resource?.name}&quot;. The
            user will be able to see this reason and resubmit after fixing the
            issues.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="rejection-reason" className="text-sm font-medium">
              Rejection Reason <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="rejection-reason"
              placeholder="e.g., Description is too vague, missing repository URL, duplicate of another resource..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1.5"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setReason("");
              onOpenChange(false);
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? "Rejecting..." : "Reject Resource"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
