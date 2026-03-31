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
import { cn } from "@/lib/utils";
import MDEditor from "@uiw/react-md-editor";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { submitResource } from "@/actions/submit";
import {
  getCategories,
  addCategory,
  deleteCategory,
} from "@/actions/categories";
import { api } from "@/trpc/react";
import { Plus, Trash2, Settings2, Sparkles, RefreshCw } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  GitHubStatsSidebar,
  type GitHubStats,
} from "@/components/GitHubStatsSidebar";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  shortDescription: z
    .string()
    .min(10, "Short description must be at least 10 characters"),
  oneLiner: z
    .string()
    .max(100, "One-liner must be 100 characters or less")
    .optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  websiteUrl: z
    .string()
    .url("Please enter a valid Website URL")
    .optional()
    .or(z.literal("")),
  repositoryUrl: z.string().url("Please enter a valid Repository URL"),
  categories: z
    .array(z.string())
    .min(1, "Please select at least one category")
    .max(5, "Max 5 categories"),
  tags: z.string().optional(),
  builtWith: z.string().optional(),
  alternative: z.string().optional(),
  image: z.string().optional(),
  logo: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// CATEGORIES removed as it is now dynamic

interface SubmitFormProps {
  initialData?: Partial<FormData>;
  mode?: "admin" | "public";
  onSuccess?: () => void;
  hideHeader?: boolean;
}

export function SubmitForm({
  initialData,
  mode = "admin",
  onSuccess,
  hideHeader = false,
}: SubmitFormProps) {
  const { theme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = React.useState<
    { id: string; name: string; status: string }[]
  >([]);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [isManagingCategories, setIsManagingCategories] = React.useState(false);
  const [isAiGenerated, setIsAiGenerated] = React.useState(false);
  const [suggestedCategories, setSuggestedCategories] = React.useState<
    string[]
  >([]);
  const [githubStatsPreview, setGithubStatsPreview] =
    React.useState<GitHubStats | null>(null);

  const generateDescriptionMutation = api.ai.generateDescription.useMutation({
    onSuccess: (data) => {
      setValue("description", data.description);
      setValue("shortDescription", data.shortDescription);
      if (data.oneLiner) setValue("oneLiner", data.oneLiner);
      setSuggestedCategories(data.categories);
      if (data.tags?.length) setValue("tags", data.tags.join(", "));
      if (data.builtWith?.length)
        setValue("builtWith", data.builtWith.map((t) => t.name).join(", "));
      setIsAiGenerated(true);
      // Set GitHub stats preview if available
      if (data.githubStats) {
        setGithubStatsPreview(data.githubStats);
      }
      toast.success(
        data.cached
          ? "Description loaded from cache"
          : `Description generated (${data.confidence} confidence)`,
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate description");
    },
  });

  const fetchCategories = React.useCallback(async () => {
    const result = await getCategories(mode === "admin");
    if (result.success && result.data) {
      setCategories(result.data);
    }
  }, [mode]);

  React.useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (name?: string) => {
    const catName = name ?? newCategoryName;
    if (!catName.trim()) return;
    const addedBy = mode === "admin" ? "ADMIN" : "USER";
    const result = await addCategory(catName, addedBy);
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
    defaultValues: initialData ?? {
      id: "",
      name: "",
      shortDescription: "",
      oneLiner: "",
      description: "",
      websiteUrl: "",
      repositoryUrl: "",
      categories: [],
      tags: "",
      builtWith: "",
      alternative: "",
      image: "",
      logo: "",
    },
  });

  const repositoryUrl = watch("repositoryUrl");

  const handleGenerateDescription = (forceRefresh = false) => {
    if (!repositoryUrl) {
      toast.error("Please enter a Repository URL first");
      return;
    }
    toast.info(
      forceRefresh ? "Regenerating description..." : "Starting generation...",
    );
    if (!forceRefresh) {
      setIsAiGenerated(false);
      setSuggestedCategories([]);
    }
    generateDescriptionMutation.mutate({
      repoUrl: repositoryUrl,
      forceRefresh,
    });
  };

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("mode", mode);
      Object.entries(data).forEach(([key, value]) => {
        if (key === "categories") {
          formData.append(key, JSON.stringify(value));
        } else if (value) {
          formData.append(key, value as string);
        }
      });

      // Add GitHub stats if available from AI generation
      if (githubStatsPreview) {
        formData.append("stars", String(githubStatsPreview.stars));
        formData.append("forks", String(githubStatsPreview.forks));
        if (githubStatsPreview.lastCommit)
          formData.append("lastCommit", githubStatsPreview.lastCommit);
        if (githubStatsPreview.repositoryCreatedAt)
          formData.append(
            "repositoryCreatedAt",
            githubStatsPreview.repositoryCreatedAt,
          );
        if (githubStatsPreview.license)
          formData.append("license", githubStatsPreview.license);
      }

      const result = await submitResource(formData);

      if (result.success) {
        toast.success(result.message);
        reset();
        setSuggestedCategories([]);
        setIsAiGenerated(false);
        setGithubStatsPreview(null);
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col items-center space-y-6 overflow-auto",
        mode === "admin" ? "bg-background p-4 sm:p-6" : "bg-transparent",
      )}
    >
      {mode === "admin" && !hideHeader && (
        <div className="w-full space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Admin Submit</h2>
          <p className="text-muted-foreground">
            Add a new resource directly to the database.
          </p>
        </div>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Resource Details</CardTitle>
          <CardDescription>
            Fill in the details of the resource you want to add.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <Label className="mb-4 block">Resource Logo</Label>
              <Controller
                control={control}
                name="logo"
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    onRemove={() => field.onChange("")}
                    title="Resource Logo"
                    description="Square 1:1, Max 2MB"
                  />
                )}
              />
              {errors.logo && (
                <p className="text-destructive mt-2 text-sm font-medium">
                  {errors.logo.message}
                </p>
              )}
            </div>
            <div>
              <Label className="mb-4 block">Resource Banner</Label>
              <Controller
                control={control}
                name="image"
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    onRemove={() => field.onChange("")}
                    title="Resource Banner"
                    description="Recommended 1200x630px"
                  />
                )}
              />
              {errors.image && (
                <p className="text-destructive mt-2 text-sm font-medium">
                  {errors.image.message}
                </p>
              )}
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <div className="flex h-8 items-center">
                <Label htmlFor="name">Name</Label>
              </div>
              <Input
                id="name"
                placeholder="Resource Name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-destructive text-sm font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-1">
              <div className="flex h-8 items-center">
                <Label htmlFor="category">Categories</Label>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Controller
                      control={control}
                      name="categories"
                      render={({ field }) => (
                        <MultiSelect
                          selected={field.value}
                          onChange={field.onChange}
                          options={categories.map((c) => ({
                            value: c.name,
                            label: c.name,
                          }))}
                          placeholder="Select categories..."
                          maxItems={5}
                        />
                      )}
                    />
                  </div>
                  <Dialog
                    open={isManagingCategories}
                    onOpenChange={setIsManagingCategories}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 shrink-0 gap-2 px-3"
                      >
                        <Settings2 className="h-4 w-4" />
                        {mode === "admin" ? "Manage" : "Add Category"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {mode === "admin"
                            ? "Manage Categories"
                            : "Categories"}
                        </DialogTitle>
                        <DialogDescription>
                          {mode === "admin"
                            ? "Add or remove resource categories."
                            : "Select existing categories or suggest a new one."}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {/* Existing categories list - shown for all users */}
                        <div className="max-h-[250px] space-y-2 overflow-auto pr-1">
                          {categories.length === 0 ? (
                            <p className="text-muted-foreground py-4 text-center text-sm">
                              No categories found.
                            </p>
                          ) : (
                            categories.map((cat) => {
                              const currentSelected = watch("categories");
                              const isSelected = currentSelected.includes(
                                cat.name,
                              );
                              return (
                                <div
                                  key={cat.id}
                                  className={`flex items-center justify-between rounded-md p-2 ${
                                    isSelected
                                      ? "bg-primary/10 border-primary/30 border"
                                      : "bg-muted/50"
                                  } ${mode === "admin" ? "" : "hover:bg-muted cursor-pointer"}`}
                                  onClick={() => {
                                    if (mode !== "admin") {
                                      if (isSelected) {
                                        setValue(
                                          "categories",
                                          currentSelected.filter(
                                            (c) => c !== cat.name,
                                          ),
                                        );
                                      } else if (currentSelected.length < 5) {
                                        setValue("categories", [
                                          ...currentSelected,
                                          cat.name,
                                        ]);
                                      }
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                      {cat.name}
                                    </span>
                                    {cat.status !== "APPROVED" && (
                                      <Badge
                                        variant={
                                          cat.status === "PENDING"
                                            ? "secondary"
                                            : "destructive"
                                        }
                                        className="text-xs"
                                      >
                                        {cat.status}
                                      </Badge>
                                    )}
                                    {mode !== "admin" && isSelected && (
                                      <span className="text-primary text-xs font-medium">
                                        Selected
                                      </span>
                                    )}
                                  </div>
                                  {mode === "admin" ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        void handleDeleteCategory(cat.id);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    !isSelected &&
                                    currentSelected.length < 5 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setValue("categories", [
                                            ...currentSelected,
                                            cat.name,
                                          ]);
                                        }}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    )
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Create new category input */}
                        <div className="border-t pt-4">
                          <p className="text-muted-foreground mb-2 text-xs font-medium">
                            {mode === "admin"
                              ? "Add new category:"
                              : "Suggest a new category:"}
                          </p>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="New category name..."
                              value={newCategoryName}
                              onChange={(e) =>
                                setNewCategoryName(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  void handleAddCategory();
                                }
                              }}
                            />
                            <Button
                              onClick={() => void handleAddCategory()}
                              size="sm"
                            >
                              <Plus className="mr-1 h-4 w-4" />
                              {mode === "admin" ? "Add" : "Submit"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Suggested Categories */}
                {suggestedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="text-muted-foreground mr-1 self-center text-xs">
                      Suggested:
                    </span>
                    {suggestedCategories.map((suggestion) => {
                      const exists = categories.some(
                        (c) =>
                          c.name.toLowerCase() === suggestion.toLowerCase(),
                      );
                      return (
                        <Badge
                          key={suggestion}
                          variant={exists ? "secondary" : "outline"}
                          className="hover:bg-primary/20 cursor-pointer transition-colors"
                          onClick={() => {
                            if (exists) {
                              // Use specific matching name to be safe
                              const match = categories.find(
                                (c) =>
                                  c.name.toLowerCase() ===
                                  suggestion.toLowerCase(),
                              );
                              if (match) {
                                const current = watch("categories");
                                if (
                                  !current.includes(match.name) &&
                                  current.length < 5
                                ) {
                                  setValue("categories", [
                                    ...current,
                                    match.name,
                                  ]);
                                }
                              }
                            } else {
                              // Pre-fill creation
                              setNewCategoryName(suggestion);
                              setIsManagingCategories(true);
                              toast.info(
                                `Review and add "${suggestion}" as a new category`,
                              );
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
              {errors.categories && (
                <p className="text-destructive text-sm font-medium">
                  {errors.categories.message}
                </p>
              )}
            </div>

            {/* One Liner Field */}
            <div className="space-y-2">
              <div className="flex h-8 items-center justify-between">
                <Label htmlFor="oneLiner">One Liner</Label>
              </div>
              <Input
                id="oneLiner"
                placeholder="Marketing-style one-liner (max 100 chars)..."
                {...register("oneLiner")}
              />
              {errors.oneLiner && (
                <p className="text-destructive text-sm font-medium">
                  {errors.oneLiner.message}
                </p>
              )}
            </div>

            {/* Short Description Field */}
            <div className="space-y-2">
              <div className="flex h-8 items-center justify-between">
                <Label htmlFor="shortDescription">Short Description</Label>
              </div>
              <Input
                id="shortDescription"
                placeholder="Concise one-sentence description..."
                {...register("shortDescription")}
              />
              {errors.shortDescription && (
                <p className="text-destructive text-sm font-medium">
                  {errors.shortDescription.message}
                </p>
              )}
            </div>

            <div
              className="space-y-2"
              data-color-mode={theme === "dark" ? "dark" : "light"}
            >
              <div className="flex h-8 items-center gap-2">
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
                <p className="text-destructive text-sm font-medium">
                  {errors.description.message}
                </p>
              )}
              <div className="flex justify-start gap-2 pt-2">
                <Button
                  type="button"
                  className="bg-foreground text-background hover:bg-foreground/90 gap-2"
                  onClick={() => handleGenerateDescription(false)}
                  disabled={generateDescriptionMutation.isPending}
                >
                  <Sparkles className="h-4 w-4" />
                  {generateDescriptionMutation.isPending && !isAiGenerated
                    ? "Generating..."
                    : "Generate with AI"}
                </Button>
                {isAiGenerated && (
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleGenerateDescription(true)}
                    disabled={generateDescriptionMutation.isPending}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${generateDescriptionMutation.isPending ? "animate-spin" : ""}`}
                    />
                    Regenerate
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex h-8 items-center">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                </div>
                <Input
                  id="websiteUrl"
                  placeholder="https://"
                  {...register("websiteUrl")}
                />
                {errors.websiteUrl && (
                  <p className="text-destructive text-sm font-medium">
                    {errors.websiteUrl.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex h-8 items-center">
                  <Label htmlFor="repositoryUrl">Repository URL</Label>
                </div>
                <Input
                  id="repositoryUrl"
                  placeholder="https://github.com/..."
                  {...register("repositoryUrl")}
                />
                {errors.repositoryUrl && (
                  <p className="text-destructive text-sm font-medium">
                    {errors.repositoryUrl.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex h-8 items-center">
                <Label htmlFor="alternative">Alternative To (Optional)</Label>
              </div>
              <Input
                id="alternative"
                placeholder="e.g. Vercel, Algolia"
                {...register("alternative")}
              />
              {errors.alternative && (
                <p className="text-destructive text-sm font-medium">
                  {errors.alternative.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex h-8 items-center">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                </div>
                <Input
                  id="tags"
                  placeholder="e.g. llm, automation, cli"
                  {...register("tags")}
                />
              </div>
              <div className="space-y-2">
                <div className="flex h-8 items-center">
                  <Label htmlFor="builtWith">
                    Tech Stack (comma-separated)
                  </Label>
                </div>
                <Input
                  id="builtWith"
                  placeholder="e.g. React, TypeScript, PostgreSQL"
                  {...register("builtWith")}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending
                ? initialData?.id
                  ? "Updating..."
                  : "Submitting..."
                : initialData?.id
                  ? "Update Resource"
                  : "Submit Resource"}
            </Button>
          </form>

          {/* GitHub Stats Preview */}
          {githubStatsPreview && (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold">
                GitHub Stats Preview
              </h3>
              <GitHubStatsSidebar stats={githubStatsPreview} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
