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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { submitReport } from "@/actions/reports";
import { toast } from "sonner";

const REPORT_TYPES = [
  { value: "BROKEN_LINK", label: "Broken Link" },
  { value: "WRONG_CATEGORY", label: "Wrong Category" },
  { value: "WRONG_TAGS", label: "Wrong Tags" },
  { value: "OUTDATED", label: "Outdated" },
  { value: "OTHER", label: "Other" },
] as const;

interface ReportResourceDialogProps {
  resourceId: string;
  resourceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportResourceDialog({
  resourceId,
  resourceName,
  open,
  onOpenChange,
}: ReportResourceDialogProps) {
  const [email, setEmail] = useState("");
  const [type, setType] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOther = type === "OTHER";

  const resetForm = () => {
    setEmail("");
    setType("");
    setMessage("");
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!type) {
      toast.error("Please select an issue type");
      return;
    }

    if (isOther && !message.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    setIsSubmitting(true);
    const result = await submitReport({
      email: email.trim(),
      resourceId,
      type,
      message: message || undefined,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Report submitted successfully");
      resetForm();
      onOpenChange(false);
    } else {
      toast.error(result.error ?? "Failed to submit report");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Issue</DialogTitle>
          <DialogDescription>
            Report an issue with &quot;{resourceName}&quot;. Help us keep our
            data accurate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="report-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Issue Type <span className="text-destructive">*</span>
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-message">
              Description{" "}
              {isOther && <span className="text-destructive">*</span>}
              {!isOther && (
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              )}
            </Label>
            <Textarea
              id="report-message"
              placeholder={
                isOther
                  ? "Please describe the issue..."
                  : "Add any additional details..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !type || !email.trim()}
          >
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
