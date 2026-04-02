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
import { ExternalLink, Globe, ArrowLeft, Flag } from "lucide-react";
import Image from "next/image";

export interface Resource {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string | null;
  categories: { id: string; name: string; slug: string; status?: string }[];
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
import { ContributedBy } from "@/components/ContributedBy";
import { ReportResourceDialog } from "@/components/report-resource-dialog";

interface ResourceDetailViewProps {
  resource: Resource;
  children?: React.ReactNode;
}

export function ResourceDetailView({
  resource,
  children,
}: ResourceDetailViewProps) {
  const [reportOpen, setReportOpen] = React.useState(false);
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
                    <BreadcrumbLink href={`/category/${primaryCategory.slug}`}>
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
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:gap-4">
                <div className="flex items-center gap-3 md:block">
                  {/* Logo/Icon */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 text-xl font-bold text-neutral-900 uppercase shadow-lg md:h-16 md:w-16 md:text-2xl dark:border-neutral-800 dark:bg-neutral-900 dark:text-white">
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
                  {/* Title (Mobile Only) */}
                  <div className="min-w-0 flex-1 md:hidden">
                    <h1 className="text-foreground text-3xl font-bold tracking-tight">
                      {resource.name}
                    </h1>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="hidden items-center gap-3 md:flex">
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
                    <p className="text-muted-foreground mt-0 text-lg md:mt-2">
                      {resource.shortDescription}
                    </p>
                  )}
                  {resource.alternative && (
                    <div className="mt-2 md:hidden">
                      <Badge
                        variant="outline"
                        className="h-6 border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
                      >
                        Alt to {resource.alternative}
                      </Badge>
                    </div>
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
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setReportOpen(true)}
                >
                  <Flag className="h-4 w-4" />
                  Report Issue
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
                <h3 className="text-foreground text-muted-foreground/70 text-sm font-semibold tracking-wider uppercase">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resource.categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-1">
                      {cat.status === "APPROVED" || !cat.status ? (
                        <Link href={`/category/${cat.slug}`}>
                          <Badge
                            variant="secondary"
                            className="bg-neutral-100 px-3 py-1 text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                          >
                            {cat.name}
                          </Badge>
                        </Link>
                      ) : (
                        <Badge
                          variant={
                            cat.status === "PENDING" ? "outline" : "destructive"
                          }
                          className="px-3 py-1"
                          title={
                            cat.status === "PENDING"
                              ? "This category is pending admin approval"
                              : "This category was rejected"
                          }
                        >
                          {cat.name}
                          <span className="ml-1.5 text-xs opacity-70">
                            ({cat.status})
                          </span>
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-foreground text-muted-foreground/70 text-sm font-semibold tracking-wider uppercase">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-2">
                    {resource.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags?filter=${encodeURIComponent(tag)}`}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Built with */}
              {resource.builtWith &&
                (resource.builtWith as TechItem[]).length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-foreground text-muted-foreground/70 text-sm font-semibold tracking-wider uppercase">
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

            {/* Contributed by */}
            {resource.user && <ContributedBy user={resource.user} />}
          </div>

          {/* Sidebar */}
          <aside className="sticky top-24 h-fit space-y-6 self-start">
            <GitHubStatsSidebar stats={githubStats} />
          </aside>
        </div>

        {children}
      </div>
      <ReportResourceDialog
        resourceId={resource.id}
        resourceName={resource.name}
        open={reportOpen}
        onOpenChange={setReportOpen}
      />
    </div>
  );
}
