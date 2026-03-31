"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { ShareSection } from "@/components/ShareSection";
import {
  ContributorsCard,
  type ContributorData,
} from "@/components/ContributorsCard";
import { TechStack, type TechItem } from "@/components/TechStack";
import { ContributedBy } from "@/components/ContributedBy";
import {
  ArrowLeft,
  ExternalLink,
  Star,
  GitFork,
  Clock,
  Calendar,
  Scale,
  Bookmark,
} from "lucide-react";
import { formatCompactNumber } from "@/lib/format";

interface BookmarkItem {
  id: string | number;
}

interface GitHubRepoDetailViewProps {
  repo: {
    id: string;
    slug: string;
    name: string;
    description: string;
    shortDescription: string | null;
    oneLiner: string | null;
    language: string;
    stars: number;
    forks: number;
    lastCommit: Date | null;
    repositoryCreatedAt: Date | null;
    license: string | null;
    repositoryUrl: string;
    logo: string | null;
    tags: string[];
    categories: { id: string; name: string; slug: string }[];
    builtWith: { name: string; slug: string }[] | null;
    user: {
      name: string | null;
      username: string | null;
      image: string | null;
    } | null;
  };
  contributors?: ContributorData[];
  children?: React.ReactNode;
}

function formatLastCommit(lastCommit: Date | null): string {
  if (!lastCommit) return "Unknown";
  const commitDate = new Date(lastCommit);
  const now = new Date();
  const diffMs = now.getTime() - commitDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  const months = Math.floor(diffDays / 30);
  return `${months}mo ago`;
}

function calculateRepoAge(createdAt: Date | null): string {
  if (!createdAt) return "Unknown";
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months !== 1 ? "s" : ""}`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} year${years !== 1 ? "s" : ""}`;
}

export function GitHubRepoDetailView({
  repo,
  contributors = [],
  children,
}: GitHubRepoDetailViewProps) {
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  React.useEffect(() => {
    const bookmarks = JSON.parse(
      localStorage.getItem("openstore-bookmarks") ?? "[]",
    ) as BookmarkItem[];
    setIsBookmarked(bookmarks.some((item) => item.id === repo.id));
  }, [repo.id]);

  const handleBookmarkClick = () => {
    const bookmarks = JSON.parse(
      localStorage.getItem("openstore-bookmarks") ?? "[]",
    ) as BookmarkItem[];

    if (isBookmarked) {
      const updated = bookmarks.filter((item) => item.id !== repo.id);
      localStorage.setItem("openstore-bookmarks", JSON.stringify(updated));
      setIsBookmarked(false);
    } else {
      if (bookmarks.length >= 10) {
        alert("You can only bookmark up to 10 items.");
        return;
      }
      const bookmarkData = {
        id: repo.id,
        title: repo.name,
        description:
          repo.oneLiner ??
          repo.shortDescription ??
          repo.description.slice(0, 100),
        category: repo.language,
        stars: repo.stars.toString(),
        forks: repo.forks.toString(),
        lastCommit: formatLastCommit(repo.lastCommit),
        bookmarkedAt: new Date().toISOString(),
        type: "github-repo",
        url: repo.repositoryUrl,
      } as unknown as BookmarkItem;
      bookmarks.push(bookmarkData);
      localStorage.setItem("openstore-bookmarks", JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const statItems = [
    {
      label: "Stars",
      value: formatCompactNumber(repo.stars),
      Icon: Star,
      iconClass: "text-amber-400",
    },
    {
      label: "Forks",
      value: formatCompactNumber(repo.forks),
      Icon: GitFork,
      iconClass: "text-blue-400",
    },
    {
      label: "Last commit",
      value: formatLastCommit(repo.lastCommit),
      Icon: Clock,
      iconClass: "text-green-400",
    },
    {
      label: "Age",
      value: calculateRepoAge(repo.repositoryCreatedAt),
      Icon: Calendar,
      iconClass: "text-purple-400",
    },
    {
      label: "License",
      value: repo.license ?? "Not specified",
      Icon: Scale,
      iconClass: "text-orange-400",
    },
  ];

  return (
    <div className="bg-background min-h-screen w-full">
      <div className="mx-auto max-w-[1152px] px-5 pt-4 pb-20 md:px-6 md:pt-6">
        {/* Breadcrumb */}
        <div className="mb-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/github-repos">
                  GitHub Repos
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{repo.name}</BreadcrumbPage>
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
            <Link href="/github-repos">
              <ArrowLeft className="h-4 w-4" />
              Back to Repos
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {repo.logo ? (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
                    <Image
                      src={repo.logo}
                      alt={repo.name}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-xl font-bold text-white uppercase">
                    {repo.name.slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
                      {repo.name}
                    </h1>
                  </div>
                  {repo.oneLiner && (
                    <p className="text-muted-foreground mt-2 text-base">
                      {repo.oneLiner}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild className="gap-2">
                  <a
                    href={repo.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on GitHub
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className={`gap-2 ${isBookmarked ? "border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600" : ""}`}
                  onClick={handleBookmarkClick}
                >
                  <Bookmark
                    className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                  />
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="prose dark:prose-invert prose-neutral max-w-none [&_h1]:text-neutral-900 dark:[&_h1]:text-white [&_h2]:text-neutral-900 dark:[&_h2]:text-white [&_h3]:text-neutral-900 dark:[&_h3]:text-white [&_strong]:text-neutral-900 dark:[&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-6">
              <h2 className="text-foreground mb-4 text-xl font-semibold">
                About
              </h2>
              <MarkdownRenderer
                content={repo.description}
                className="text-muted-foreground leading-relaxed"
              />
            </div>

            {/* Categories, Tags & Built With */}
            <div className="space-y-8 border-t border-neutral-200 pt-8 dark:border-neutral-800">
              {/* Categories */}
              {repo.categories.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-muted-foreground/70 text-sm font-semibold tracking-wider uppercase">
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {repo.categories.map((cat) => (
                      <Link key={cat.id} href={`/category/${cat.slug}`}>
                        <Badge
                          variant="secondary"
                          className="bg-neutral-100 px-3 py-1 text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                        >
                          {cat.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {repo.tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-muted-foreground/70 text-sm font-semibold tracking-wider uppercase">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-2">
                    {repo.tags.map((tag) => (
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
              {repo.builtWith && repo.builtWith.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-muted-foreground/70 text-sm font-semibold tracking-wider uppercase">
                    Built with
                  </h3>
                  <TechStack items={repo.builtWith as TechItem[]} />
                </div>
              )}
            </div>

            {/* Share */}
            <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
              <ShareSection url={shareUrl} title={repo.name} />
            </div>

            {/* Contributed by */}
            {repo.user && <ContributedBy user={repo.user} />}
          </div>

          {/* Sidebar */}
          <aside className="sticky top-24 h-fit space-y-6">
            <Card className="border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-200">
                  Repository Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {statItems.map(({ label, value, Icon, iconClass }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2.5 text-neutral-600 dark:text-neutral-400">
                      <Icon className={`h-4 w-4 ${iconClass}`} />
                      <span>{label}</span>
                    </div>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {value}
                    </span>
                  </div>
                ))}

                <Button
                  size="sm"
                  className="mt-4 w-full gap-2 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                  asChild
                >
                  <a
                    href={repo.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Repository
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Contributors */}
            <ContributorsCard
              contributors={contributors}
              repositoryUrl={repo.repositoryUrl}
            />
          </aside>
        </div>

        {children}
      </div>
    </div>
  );
}
