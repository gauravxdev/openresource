/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SubmitForm } from "@/components/submit-form";
import { useRouter } from "next/navigation";

interface AdminEditResourceDialogProps {
  resource: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminEditResourceDialog({
  resource,
  open,
  onOpenChange,
}: AdminEditResourceDialogProps) {
  const router = useRouter();

  const initialData = {
    id: resource?.id ?? "",
    name: resource?.name ?? "",
    shortDescription: resource?.shortDescription ?? "",
    oneLiner: resource?.oneLiner ?? "",
    description: resource?.description ?? "",
    websiteUrl: resource?.websiteUrl ?? "",
    repositoryUrl: resource?.repositoryUrl ?? "",
    categories: resource?.categories?.map((c: any) => c.name) ?? [],
    tags: resource?.tags?.length ? resource.tags.join(", ") : "",
    builtWith: resource?.builtWith?.length
      ? resource.builtWith.map((t: any) => t.name).join(", ")
      : "",
    alternative: resource?.alternative ?? "",
    image: resource?.image ?? "",
    logo: resource?.logo ?? "",
  };

  const handleSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-[900px]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Edit Resource</DialogTitle>
          <DialogDescription>
            Update all details for this resource. Changes will be saved
            immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <SubmitForm
            initialData={initialData}
            mode="admin"
            onSuccess={handleSuccess}
            hideHeader
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
