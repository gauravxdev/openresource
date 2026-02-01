"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Loader2,
    ArrowRight,
    Globe,
    Zap,
    ArrowRightLeft,
    Grid2X2,
    Image as ImageIcon,
} from "lucide-react"
import { ImageUpload } from "@/components/admin/image-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MultiSelect, type CategoryOption } from "@/components/ui/multi-select"
import { submitResource, getCategories } from "@/actions/submit"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function SubmitPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [imageUrl, setImageUrl] = React.useState("")
    const [logoUrl, setLogoUrl] = React.useState("")
    const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])
    const [categoryOptions, setCategoryOptions] = React.useState<CategoryOption[]>([])

    React.useEffect(() => {
        getCategories().then(setCategoryOptions)
    }, [])

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        // Check if github-repo is in selected categories (re-evaluate on each submit)
        // Normalize category names by replacing spaces with hyphens for comparison
        const isGitHubRepo = selectedCategories.some(cat => {
            const normalized = cat.toLowerCase().replace(/\s+/g, "-")
            return normalized === "github-repo" || normalized === "github-repos"
        })

        console.log("Submit attempt - Categories:", selectedCategories)
        console.log("Is GitHub Repo:", isGitHubRepo)
        console.log("Image URL:", imageUrl)

        // Validate image requirement on frontend
        if (!isGitHubRepo && !imageUrl) {
            toast.error("Image is required for non-GitHub repository resources")
            setIsLoading(false)
            return
        }

        const formData = new FormData(event.currentTarget)
        if (imageUrl) {
            formData.append("image", imageUrl)
        }
        if (logoUrl) {
            formData.append("logo", logoUrl)
        }
        formData.append("categories", JSON.stringify(selectedCategories))

        try {
            const result = await submitResource(formData)

            if (result.success) {
                toast.success(result.message)
                setImageUrl("")
                setLogoUrl("")
                setSelectedCategories([])
                router.push("/")
            } else {
                toast.error(result.message)
            }
        } catch {
            toast.error("An unexpected error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full bg-black min-h-screen text-white">
            <div className="mx-auto max-w-[1152px] px-5 pb-20 pt-8 md:px-6 md:pt-12">
                {/* Breadcrumb Navigation */}
                <div className="mb-12">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/" className="text-gray-400 hover:text-white transition-colors">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-gray-600" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-white">Submit Resource</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="space-y-4 mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Submit your Open Source Resource</h1>
                    <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
                        The ultimate hub for discovering open-source projects, websites, and developer tools.<br />
                        Join the OpenResource community by sharing the innovations that empower the future.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-16">
                    {/* Left Column: Form */}
                    <div className="space-y-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-200 block mb-4">
                                    Resource Logo:
                                </Label>
                                <ImageUpload
                                    value={logoUrl}
                                    onChange={setLogoUrl}
                                    onRemove={() => setLogoUrl("")}
                                    title="Resource Logo"
                                    description="Square image (1:1). Max 2MB."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-200 block mb-4">
                                    Resource Image:{" "}
                                    {!selectedCategories.some(cat => {
                                        const normalized = cat.toLowerCase().replace(/\s+/g, "-")
                                        return normalized === "github-repo" || normalized === "github-repos"
                                    }) && <span className="text-red-500">*</span>}
                                </Label>
                                <ImageUpload
                                    value={imageUrl}
                                    onChange={setImageUrl}
                                    onRemove={() => setImageUrl("")}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium text-gray-200">
                                        Name: <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Enter Name"
                                        required
                                        disabled={isLoading}
                                        className="bg-neutral-900/50 border-neutral-800 focus:border-neutral-700 h-12 text-white placeholder:text-gray-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="websiteUrl" className="text-sm font-medium text-gray-200">
                                        Website URL: <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="websiteUrl"
                                        name="websiteUrl"
                                        type="url"
                                        placeholder="Enter Website URL"
                                        required
                                        disabled={isLoading}
                                        className="bg-neutral-900/50 border-neutral-800 focus:border-neutral-700 h-12 text-white placeholder:text-gray-600"
                                    />
                                </div>
                            </div>



                            <div className="space-y-2">
                                <Label htmlFor="shortDescription" className="text-sm font-medium text-gray-200">
                                    Short Description:
                                </Label>
                                <Input
                                    id="shortDescription"
                                    name="shortDescription"
                                    placeholder="Brief summary (min 10 chars)..."
                                    disabled={isLoading}
                                    className="bg-neutral-900/50 border-neutral-800 focus:border-neutral-700 h-12 text-white placeholder:text-gray-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium text-gray-200">
                                    Description: <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Detailed description (min 10 chars)..."
                                    required
                                    disabled={isLoading}
                                    className="bg-neutral-900/50 border-neutral-800 focus:border-neutral-700 min-h-[120px] text-white placeholder:text-gray-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="repositoryUrl" className="text-sm font-medium text-gray-200">
                                    Repository URL: <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="repositoryUrl"
                                    name="repositoryUrl"
                                    type="url"
                                    placeholder="Enter Repository URL"
                                    required
                                    disabled={isLoading}
                                    className="bg-neutral-900/50 border-neutral-800 focus:border-neutral-700 h-12 text-white placeholder:text-gray-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-200">
                                    Categories: <span className="text-red-500">*</span>
                                </Label>
                                <MultiSelect
                                    selected={selectedCategories}
                                    onChange={setSelectedCategories}
                                    options={categoryOptions}
                                    placeholder="Select or create categories (max 5)"
                                    maxItems={5}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="alternative" className="text-sm font-medium text-gray-200">
                                    Suggest an alternative::
                                </Label>
                                <Input
                                    id="alternative"
                                    name="alternative"
                                    placeholder="Which well-known tool is this an alternative to?"
                                    disabled={isLoading}
                                    className="bg-neutral-900/50 border-neutral-800 focus:border-neutral-700 h-12 text-white placeholder:text-gray-600"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-white text-black hover:bg-gray-200 rounded-lg px-8 py-6 text-base font-semibold transition-all group"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Submit
                                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Right Column: Guidelines */}
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold">Submission Guidelines</h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                We review all submissions to ensure high quality.
                            </p>
                        </div>

                        <div className="space-y-6 text-sm">
                            <div className="flex gap-3">
                                <div className="mt-1">
                                    <Globe className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-100">Public Repository</p>
                                    <p className="text-gray-500">Must be hosted on GitHub and not archived.</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="mt-1">
                                    <Globe className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-100">Custom Domain</p>
                                    <p className="text-gray-500">No temporary subdomains (vercel.app, netlify.app, etc.).</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="mt-1">
                                    <Grid2X2 className="h-5 w-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-100">Real Application</p>
                                    <p className="text-gray-500">Full applications only, not CLIs, scripts, libraries or AI wrappers.</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="mt-1">
                                    <Zap className="h-5 w-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-100">Available Now</p>
                                    <p className="text-gray-500">No waitlist or &quot;coming soon&quot; products.</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="mt-1">
                                    <ArrowRightLeft className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-100">Clear Alternative</p>
                                    <p className="text-gray-500">Must be an alternative to proprietary software.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}
