"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { updateContributorResource } from "@/actions/contributor/resources";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const editSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().min(1, "Description is required"),
    oneLiner: z.string().optional(),
    websiteUrl: z.string().url().optional().or(z.literal("")),
    repositoryUrl: z.string().url("Must be a valid URL"),
    alternative: z.string().optional(),
});

interface EditResourceDialogProps {
    resource: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditResourceDialog({ resource, open, onOpenChange }: EditResourceDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<z.infer<typeof editSchema>>({
        resolver: zodResolver(editSchema),
        defaultValues: {
            name: resource?.name || "",
            slug: resource?.slug || "",
            oneLiner: resource?.oneLiner || "",
            description: resource?.description || "",
            websiteUrl: resource?.websiteUrl || "",
            repositoryUrl: resource?.repositoryUrl || "",
            alternative: resource?.alternative || "",
        },
    });

    async function onSubmit(values: z.infer<typeof editSchema>) {
        setIsSubmitting(true);
        try {
            const result = await updateContributorResource(resource.id, values);
            if (result.success) {
                toast.success("Resource updated successfully");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update resource");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Resource</DialogTitle>
                    <DialogDescription>
                        Update the details of your resource. Changes will be saved immediately.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="e.g. Next.js" {...register("name")} />
                            {errors.name && (
                                <p className="text-sm font-medium text-destructive">{errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input id="slug" placeholder="e.g. next-js" {...register("slug")} />
                            {errors.slug && (
                                <p className="text-sm font-medium text-destructive">{errors.slug.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="oneLiner">One Liner</Label>
                        <Input id="oneLiner" placeholder="A short catchphrase..." {...register("oneLiner")} />
                        {errors.oneLiner && (
                            <p className="text-sm font-medium text-destructive">{errors.oneLiner.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                            id="description"
                            placeholder="Detailed description of the resource..." 
                            className="resize-none h-32" 
                            {...register("description")} 
                        />
                        {errors.description && (
                            <p className="text-sm font-medium text-destructive">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="repositoryUrl">Repository URL</Label>
                            <Input id="repositoryUrl" placeholder="https://github.com/..." {...register("repositoryUrl")} />
                            {errors.repositoryUrl && (
                                <p className="text-sm font-medium text-destructive">{errors.repositoryUrl.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="websiteUrl">Website URL (optional)</Label>
                            <Input id="websiteUrl" placeholder="https://..." {...register("websiteUrl")} />
                            {errors.websiteUrl && (
                                <p className="text-sm font-medium text-destructive">{errors.websiteUrl.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="alternative">Alternative To (optional)</Label>
                        <Input id="alternative" placeholder="e.g. Vercel, Firebase..." {...register("alternative")} />
                        {errors.alternative && (
                            <p className="text-sm font-medium text-destructive">{errors.alternative.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
