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
import {
  GitHubStatsSidebar,
  type GitHubStats,
} from "@/components/GitHubStatsSidebar";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { ExternalLink, Globe, ArrowLeft } from "lucide-react";
import Image from "next/image";

export interface Resource {
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
  tags: string[];
  builtWith: { name: string; slug: string }[] | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string | null;
    username: string | null;
    image: string | null;
  } | null;
}

import { TechStack, type TechItem } from "@/components/TechStack";
import { ShareSection } from "@/components/ShareSection";

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
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="bg-background min-h-screen w-full">
      <div className="mx-auto max-w-[1152px] px-5 pt-4 pb-20 md:px-6 md:pt-6">
        {/* Breadcrumb Navigation */}
        <div className="mb-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {primaryCategory && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/categories?filter=${encodeURIComponent(primaryCategory.name)}`}
                    >
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
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Resources
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
          {/* Main Content Area */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {/* Logo/Icon */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 text-2xl font-bold text-neutral-900 uppercase shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:text-white">
                  {resource.logo ? (
                    <Image
                      src={resource.logo}
                      alt={`${resource.name} logo`}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
                      {resource.name.slice(0, 1)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
                      {resource.name}
                    </h1>
                    {resource.alternative && (
                      <Badge
                        variant="outline"
                        className="h-6 border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
                      >
                        Alt to {resource.alternative}
                      </Badge>
                    )}
                  </div>
                  {resource.shortDescription && (
                    <p className="text-muted-foreground mt-2 text-lg">
                      {resource.shortDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                {resource.websiteUrl && (
                  <Button asChild className="gap-2">
                    <a
                      href={resource.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4" />
                      Visit Website
                    </a>
                  </Button>
                )}
                <Button variant="outline" asChild className="gap-2">
                  <a
                    href={resource.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Repository
                  </a>
                </Button>
              </div>
            </div>

            {/* Resource Image */}
            {resource.image && (
              <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
                <Image
                  src={resource.image}
                  alt={resource.name}
                  width={1200}
                  height={630}
                  priority
                  className="h-auto w-full object-cover"
                />
              </div>
            )}

            {/* Description */}
            {/* Description */}
            <div className="prose dark:prose-invert prose-neutral dark:prose-headings:text-white prose-headings:text-neutral-900 max-w-none [&_h1]:text-neutral-900 dark:[&_h1]:text-white [&_h2]:text-neutral-900 dark:[&_h2]:text-white [&_h3]:text-neutral-900 dark:[&_h3]:text-white [&_h4]:text-neutral-900 dark:[&_h4]:text-white [&_li]:marker:text-neutral-900 dark:[&_li]:marker:text-white [&_strong]:text-neutral-900 dark:[&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-6">
              <h2 className="text-foreground mb-4 text-xl font-semibold">
                About
              </h2>
              <MarkdownRenderer
                content={resource.description}
                className="text-muted-foreground leading-relaxed"
              />
            </div>

            {/* Tags & Categories & Tech Stack */}
            <div className="space-y-8 border-t border-neutral-200 pt-8 dark:border-neutral-800">
              {/* Categories */}
              <div className="space-y-3">
                <h3 className="text-foreground text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resource.categories.map((cat) => (
                    <Badge
                      key={cat.id}
                      variant="secondary"
                      className="bg-neutral-100 px-3 py-1 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                    >
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-foreground text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-2">
                    {resource.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags?filter=${encodeURIComponent(tag)}`}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Built with */}
              {resource.builtWith && (resource.builtWith as TechItem[]).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-foreground text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Built with
                  </h3>
                  <TechStack items={resource.builtWith as TechItem[]} />
                </div>
              )}

              {/* Share Section */}
              <div className="pt-2">
                <ShareSection url={shareUrl} title={resource.name} />
              </div>
            </div>

            {/* Added by Section (Bottom) */}
            {resource.user && (
              <div className="flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground font-medium">
                    Contributed by
                  </span>
                  <Link
                    href={
                      resource.user.username
                        ? `/u/${resource.user.username}`
                        : "#"
                    }
                    className="group/user hover:bg-muted/50 hover:border-border flex items-center gap-2 rounded-full border border-transparent p-1.5 pr-3 transition-colors"
                  >
                    {resource.user.image ? (
                      <Image
                        src={resource.user.image}
                        className="border-border h-8 w-8 rounded-full border shadow-sm transition-transform group-hover/user:scale-105"
                        alt={resource.user.name ?? "User"}
                        width={32}
                        height={32}
                      />
                    ) : (
                      <div className="bg-primary/10 text-primary border-primary/20 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold">
                        {resource.user.name?.[0] ??
                          resource.user.username?.[0]?.toUpperCase() ??
                          "U"}
                      </div>
                    )}
                    <div className="flex flex-col -space-y-0.5">
                      {resource.user.name && (
                        <span className="text-foreground group-hover/user:text-primary text-sm font-semibold transition-colors">
                          {resource.user.name}
                        </span>
                      )}
                      <span
                        className={
                          resource.user.name
                            ? "text-muted-foreground text-xs"
                            : "text-foreground group-hover/user:text-primary text-sm font-semibold transition-colors"
                        }
                      >
                        {resource.user.username
                          ? `@${resource.user.username}`
                          : "Anonymous"}
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="sticky top-24 h-fit space-y-6 self-start">
            <GitHubStatsSidebar stats={githubStats} />
          </aside>
        </div>
      </div>
    </div>
  );
}
