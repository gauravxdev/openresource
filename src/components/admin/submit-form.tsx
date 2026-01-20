"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { submitResource } from "@/actions/submit";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    websiteUrl: z.string().url("Please enter a valid Website URL"),
    repositoryUrl: z.string().url("Please enter a valid Repository URL"),
    category: z.string().min(1, "Please select a category"),
    alternative: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const CATEGORIES = [
    "Components",
    "Templates",
    "Icons",
    "Colors",
    "Animations",
    "Illustrations",
    "Typography",
    "Tools",
    "Libraries",
    "Other",
];

export function SubmitForm() {
    const [isPending, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            websiteUrl: "",
            repositoryUrl: "",
            category: "",
            alternative: "",
        },
    });

    const onSubmit = (data: FormData) => {
        startTransition(async () => {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value) formData.append(key, value);
            });

            const result = await submitResource(formData);

            if (result.success) {
                toast.success(result.message);
                reset();
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6 bg-background w-full flex flex-col items-center">
            <div className="space-y-0.5 w-full">
                <h2 className="text-2xl font-bold tracking-tight">Admin Submit</h2>
                <p className="text-muted-foreground">
                    Add a new resource directly to the database.
                </p>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Resource Details</CardTitle>
                    <CardDescription>
                        Fill in the details of the resource you want to add.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Resource Name"
                                    {...register("name")}
                                />
                                {errors.name && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Controller
                                    control={control}
                                    name="category"
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.category && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.category.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of the resource"
                                {...register("description")}
                            />
                            {errors.description && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="websiteUrl">Website URL</Label>
                                <Input
                                    id="websiteUrl"
                                    placeholder="https://"
                                    {...register("websiteUrl")}
                                />
                                {errors.websiteUrl && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.websiteUrl.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="repositoryUrl">Repository URL</Label>
                                <Input
                                    id="repositoryUrl"
                                    placeholder="https://github.com/..."
                                    {...register("repositoryUrl")}
                                />
                                {errors.repositoryUrl && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.repositoryUrl.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="alternative">Alternative To (Optional)</Label>
                            <Input
                                id="alternative"
                                placeholder="e.g. Vercel, Algolia"
                                {...register("alternative")}
                            />
                            {errors.alternative && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.alternative.message}
                                </p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Submitting..." : "Submit Resource"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
