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

interface EditResourceDialogProps {
  resource: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditResourceDialog({
  resource,
  open,
  onOpenChange,
}: EditResourceDialogProps) {
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
            Update the details of your resource. Changes will be saved and sent
            for review.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <SubmitForm
            initialData={initialData}
            mode="public"
            onSuccess={handleSuccess}
            hideHeader
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
