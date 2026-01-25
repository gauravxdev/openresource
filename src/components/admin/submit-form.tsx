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
import { useTheme } from "next-themes";
import MDEditor from "@uiw/react-md-editor";
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
import { Badge } from "@/components/ui/badge";

import { submitResource } from "@/actions/submit";
import { getCategories, addCategory, deleteCategory } from "@/actions/categories";
import { api } from "@/trpc/react";
import { Plus, Trash2, Settings2, Sparkles, Image as ImageIcon } from "lucide-react";
import { ImageUpload } from "./image-upload";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    shortDescription: z.string().min(10, "Short description must be at least 10 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    websiteUrl: z.string().url("Please enter a valid Website URL"),
    repositoryUrl: z.string().url("Please enter a valid Repository URL"),
    category: z.string().min(1, "Please select a category"),
    alternative: z.string().optional(),
    image: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// CATEGORIES removed as it is now dynamic

export function SubmitForm() {
    const { theme } = useTheme();
    const [isPending, startTransition] = useTransition();
    const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([]);
    const [newCategoryName, setNewCategoryName] = React.useState("");
    const [isManagingCategories, setIsManagingCategories] = React.useState(false);
    const [isAiGenerated, setIsAiGenerated] = React.useState(false);
    const [suggestedCategories, setSuggestedCategories] = React.useState<string[]>([]);

    const generateDescriptionMutation = api.ai.generateDescription.useMutation({
        onSuccess: (data) => {
            setValue("description", data.description);
            setValue("shortDescription", data.shortDescription);
            setSuggestedCategories(data.categories);
            setIsAiGenerated(true);
            toast.success(
                data.cached
                    ? "Description loaded from cache"
                    : `Description generated (${data.confidence} confidence)`
            );
        },
        onError: (error) => {
            toast.error(error.message || "Failed to generate description");
        },
    });

    const fetchCategories = React.useCallback(async () => {
        const result = await getCategories();
        if (result.success && result.data) {
            setCategories(result.data);
        }
    }, []);

    React.useEffect(() => {
        void fetchCategories();
    }, [fetchCategories]);

    const handleAddCategory = async (name?: string) => {
        const catName = name || newCategoryName;
        if (!catName.trim()) return;
        const result = await addCategory(catName);
        if (result.success) {
            toast.success(result.message);
            if (!name) setNewCategoryName("");
            void fetchCategories();
        } else {
            toast.error(result.message ?? "Failed to add category");
        }
    };

    const handleDeleteCategory = async (id: string) => {
        const result = await deleteCategory(id);
        if (result.success) {
            toast.success(result.message);
            void fetchCategories();
        } else {
            toast.error(result.message ?? "Failed to delete category");
        }
    };

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            shortDescription: "",
            description: "",
            websiteUrl: "",
            repositoryUrl: "",
            category: "",
            alternative: "",
            image: "",
        },
    });

    const repositoryUrl = watch("repositoryUrl");

    const handleGenerateDescription = () => {
        if (!repositoryUrl) {
            toast.error("Please enter a Repository URL first");
            return;
        }
        toast.info("Starting generation...");
        setIsAiGenerated(false);
        setSuggestedCategories([]);
        generateDescriptionMutation.mutate({ repoUrl: repositoryUrl });
    };

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
                setSuggestedCategories([]);
                setIsAiGenerated(false);
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
                    <div className="mb-8">
                        <Label className="block mb-4">Resource Image</Label>
                        <Controller
                            control={control}
                            name="image"
                            render={({ field }) => (
                                <ImageUpload
                                    value={field.value}
                                    onChange={field.onChange}
                                    onRemove={() => field.onChange("")}
                                />
                            )}
                        />
                        {errors.image && (
                            <p className="text-sm font-medium text-destructive mt-2">
                                {errors.image.message}
                            </p>
                        )}
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <div className="h-8 flex items-center">
                                    <Label htmlFor="name">Name</Label>
                                </div>
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
                                <div className="h-8 flex items-center">
                                    <Label htmlFor="category">Category</Label>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <Controller
                                                control={control}
                                                name="category"
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map((category) => (
                                                                <SelectItem key={category.id} value={category.name}>
                                                                    {category.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                        <Dialog open={isManagingCategories} onOpenChange={setIsManagingCategories}>
                                            <DialogTrigger asChild>
                                                <Button type="button" variant="outline" className="h-10 px-3 shrink-0 gap-2">
                                                    <Settings2 className="h-4 w-4" />
                                                    Manage
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Manage Categories</DialogTitle>
                                                    <DialogDescription>
                                                        Add or remove resource categories.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            placeholder="New category name..."
                                                            value={newCategoryName}
                                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    void handleAddCategory();
                                                                }
                                                            }}
                                                        />
                                                        <Button onClick={() => void handleAddCategory()} size="sm">
                                                            <Plus className="h-4 w-4 mr-1" />
                                                            Add
                                                        </Button>
                                                    </div>
                                                    <div className="max-h-[300px] overflow-auto space-y-2 pr-1">
                                                        {categories.length === 0 ? (
                                                            <p className="text-sm text-center text-muted-foreground py-4">
                                                                No categories found.
                                                            </p>
                                                        ) : (
                                                            categories.map((cat) => (
                                                                <div
                                                                    key={cat.id}
                                                                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                                                                >
                                                                    <span className="text-sm font-medium">{cat.name}</span>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                        onClick={() => void handleDeleteCategory(cat.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {/* Suggested Categories */}
                                    {suggestedCategories.length > 0 && (
                                        <div className="flex flex-wrap gap-2 text-sm">
                                            <span className="text-muted-foreground self-center mr-1 text-xs">Suggested:</span>
                                            {suggestedCategories.map((suggestion) => {
                                                const exists = categories.some(
                                                    c => c.name.toLowerCase() === suggestion.toLowerCase()
                                                );
                                                return (
                                                    <Badge
                                                        key={suggestion}
                                                        variant={exists ? "secondary" : "outline"}
                                                        className="cursor-pointer hover:bg-primary/20 transition-colors"
                                                        onClick={() => {
                                                            if (exists) {
                                                                // Use specific matching name to be safe
                                                                const match = categories.find(c => c.name.toLowerCase() === suggestion.toLowerCase());
                                                                if (match) setValue("category", match.name);
                                                            } else {
                                                                // Pre-fill creation
                                                                setNewCategoryName(suggestion);
                                                                setIsManagingCategories(true);
                                                                toast.info(`Review and add "${suggestion}" as a new category`);
                                                            }
                                                        }}
                                                    >
                                                        {suggestion}
                                                        {!exists && <Plus className="ml-1 h-3 w-3" />}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                {errors.category && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.category.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Short Description Field */}
                        <div className="space-y-2">
                            <div className="h-8 flex items-center justify-between">
                                <Label htmlFor="shortDescription">Short Description</Label>
                            </div>
                            <Input
                                id="shortDescription"
                                placeholder="Concise one-sentence description..."
                                {...register("shortDescription")}
                            />
                            {errors.shortDescription && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.shortDescription.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2" data-color-mode={theme === "dark" ? "dark" : "light"}>
                            <div className="h-8 flex items-center gap-2">
                                <Label htmlFor="description">Long Description (MDX)</Label>
                                {isAiGenerated && (
                                    <Badge variant="secondary" className="gap-1 text-xs">
                                        <Sparkles className="h-3 w-3" />
                                        AI-written
                                    </Badge>
                                )}
                            </div>
                            <Controller
                                control={control}
                                name="description"
                                render={({ field }) => (
                                    <MDEditor
                                        value={field.value}
                                        onChange={(value) => {
                                            field.onChange(value);
                                            // If user edits the AI content, remove the AI badge
                                            if (isAiGenerated && value !== field.value) {
                                                setIsAiGenerated(false);
                                            }
                                        }}
                                        preview="edit"
                                        height={300}
                                        className="w-full"
                                    />
                                )}
                            />
                            {errors.description && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.description.message}
                                </p>
                            )}
                            <div className="flex justify-start pt-2">
                                <Button
                                    type="button"
                                    className="gap-2 bg-foreground text-background hover:bg-foreground/90"
                                    onClick={handleGenerateDescription}
                                    disabled={generateDescriptionMutation.isPending}
                                >
                                    <Sparkles className="h-4 w-4" />
                                    {generateDescriptionMutation.isPending
                                        ? "Generating..."
                                        : "Generate with AI"}
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <div className="h-8 flex items-center">
                                    <Label htmlFor="websiteUrl">Website URL</Label>
                                </div>
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
                                <div className="h-8 flex items-center">
                                    <Label htmlFor="repositoryUrl">Repository URL</Label>
                                </div>
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
                            <div className="h-8 flex items-center">
                                <Label htmlFor="alternative">Alternative To (Optional)</Label>
                            </div>
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
