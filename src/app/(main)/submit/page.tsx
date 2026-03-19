"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    Globe,
    Zap,
    ArrowRightLeft,
} from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SubmitForm } from "@/components/submit-form"

export default function SubmitPage() {
    const router = useRouter()

    return (
        <div className="w-full bg-black min-h-screen text-white">
            <div className="mx-auto max-w-[1152px] px-5 pb-20 pt-4 md:px-6 md:pt-6">
                {/* Breadcrumb Navigation */}
                <div className="mb-6">
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

                <div className="space-y-4 mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Submit your Resource</h1>
                    <p className="text-gray-400 text-lg leading-relaxed max-w-3xl mx-auto">
                        The ultimate hub for discovering open-source projects, websites, and developer tools.<br />
                        Join the OpenResource community by sharing the innovations that empower the future.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Form Section */}
                    <div className="w-full">
                        <SubmitForm
                            mode="public"
                            onSuccess={() => router.push("/")}
                        />
                    </div>

                    {/* Guidelines Section (Moved below form) */}
                    <div className="pt-12 border-t border-gray-800">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">Submission Guidelines</h2>
                                <p className="text-gray-400 text-base leading-relaxed">
                                    We review all submissions to ensure high quality and relevance to the open-source community.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        <Globe className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-100">Public Repository</p>
                                        <p className="text-gray-500 text-sm">Must be hosted on GitHub and not archived.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        <Globe className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-100">Custom Domain</p>
                                        <p className="text-gray-500 text-sm">No temporary subdomains (vercel.app, netlify.app, etc.).</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        <Zap className="h-5 w-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-100">Available Now</p>
                                        <p className="text-gray-500 text-sm">No waitlist or &quot;coming soon&quot; products.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        <ArrowRightLeft className="h-5 w-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-100">Clear Alternative</p>
                                        <p className="text-gray-500 text-sm">Must be an alternative to proprietary software.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}
