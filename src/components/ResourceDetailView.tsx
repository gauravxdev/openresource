"use client";

import * as React from "react";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitHubStatsSidebar, type GitHubStats } from "@/components/GitHubStatsSidebar";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { ExternalLink, Globe, ArrowLeft } from "lucide-react";

interface Resource {
    id: string;
    slug: string;
    name: string;
    description: string;
    shortDescription?: string | null;
    categories: { id: string; name: string; slug: string }[];
    websiteUrl: string | null;
    repositoryUrl: string;
    alternative?: string | null;
    stars: number;
    forks: number;
    lastCommit: Date | null;
    repositoryCreatedAt: Date | null;
    license: string | null;
    image?: string | null;
    logo?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

interface ResourceDetailViewProps {
    resource: Resource;
}

export function ResourceDetailView({ resource }: ResourceDetailViewProps) {
    const githubStats: GitHubStats = {
        stars: resource.stars,
        forks: resource.forks,
        lastCommit: resource.lastCommit?.toISOString() ?? null,
        repositoryCreatedAt: resource.repositoryCreatedAt?.toISOString() ?? null,
        license: resource.license,
        repositoryUrl: resource.repositoryUrl,
    };

    const primaryCategory = resource.categories[0];

    return (
        <div className="w-full bg-background min-h-screen">
            <div className="mx-auto max-w-[1152px] px-5 pb-20 pt-4 md:px-6 md:pt-6">
                {/* Breadcrumb Navigation */}
                <div className="mb-2">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/home">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            {primaryCategory && (
                                <>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href={`/categories?filter=${encodeURIComponent(primaryCategory.name)}`}>
                                            {primaryCategory.name}
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                </>
                            )}
                            <BreadcrumbItem>
                                <BreadcrumbPage>{resource.name}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Back button */}
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
                        <Link href="/home">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Resources
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
                    {/* Main Content Area */}
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                {/* Logo/Icon */}
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-2xl font-bold text-white uppercase shadow-lg overflow-hidden">
                                    {resource.logo ? (
                                        <img
                                            src={resource.logo}
                                            alt={`${resource.name} logo`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
                                            {resource.name.slice(0, 1)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                                            {resource.name}
                                        </h1>
                                        {resource.alternative && (
                                            <Badge variant="outline" className="border-neutral-700 text-neutral-400 h-6">
                                                Alt to {resource.alternative}
                                            </Badge>
                                        )}
                                    </div>
                                    {resource.shortDescription && (
                                        <p className="mt-2 text-lg text-muted-foreground">
                                            {resource.shortDescription}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 pt-4">
                                {resource.websiteUrl && (
                                    <Button asChild className="gap-2">
                                        <a href={resource.websiteUrl} target="_blank" rel="noopener noreferrer">
                                            <Globe className="h-4 w-4" />
                                            Visit Website
                                        </a>
                                    </Button>
                                )}
                                <Button variant="outline" asChild className="gap-2">
                                    <a href={resource.repositoryUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4" />
                                        View Repository
                                    </a>
                                </Button>
                            </div>
                        </div>

                        {/* Resource Image */}
                        {resource.image && (
                            <div className="rounded-xl overflow-hidden border border-neutral-800">
                                <img
                                    src={resource.image}
                                    alt={resource.name}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        )}

                        {/* Description */}
                        {/* Description */}
                        <div className="prose prose-invert prose-neutral max-w-none [&_strong]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white prose-headings:text-white [&_ul]:list-disc [&_ul]:pl-6 [&_li]:marker:text-white">
                            <h2 className="text-xl font-semibold text-foreground mb-4">About</h2>
                            <MarkdownRenderer
                                content={resource.description}
                                className="text-muted-foreground leading-relaxed"
                            />
                        </div>

                        {/* Categories */}
                        <div className="space-y-4 pt-4 border-t border-neutral-800">
                            <h3 className="text-lg font-semibold text-foreground">Categories</h3>
                            <div className="flex flex-wrap gap-2">
                                {resource.categories.map((cat) => (
                                    <Badge key={cat.id} variant="secondary" className="bg-neutral-800 text-neutral-200 hover:bg-neutral-700 px-3 py-1">
                                        {cat.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6 sticky top-24 self-start h-fit">
                        <GitHubStatsSidebar stats={githubStats} />
                    </aside>
                </div>
            </div>
        </div>
    );
}
