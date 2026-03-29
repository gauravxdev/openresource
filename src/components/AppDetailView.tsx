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
import {
  ArrowLeft,
  Star,
  Download,
  Clock,
  Scale,
  Bookmark,
  Github,
  ExternalLink,
} from "lucide-react";
import { formatCompactNumber } from "@/lib/format";

interface BookmarkItem {
  id: string | number;
}

export interface AppDetailData {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string | null;
  oneLiner: string | null;
  category: string;
  logo: string | null;
  image: string | null;
  stars: number;
  forks: number;
  lastCommit: Date | null;
  repositoryCreatedAt: Date | null;
  license: string | null;
  repositoryUrl: string;
  tags: string[];
  categories: { id: string; name: string; slug: string }[];
  builtWith: { name: string; slug: string }[] | null;
  platform: "android" | "windows";
  user: {
    name: string | null;
    username: string | null;
    image: string | null;
  } | null;
}

interface AppDetailViewProps {
  app: AppDetailData;
  contributors?: ContributorData[];
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

export function AppDetailView({ app, contributors = [] }: AppDetailViewProps) {
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  React.useEffect(() => {
    const bookmarks = JSON.parse(
      localStorage.getItem("openstore-bookmarks") ?? "[]",
    ) as BookmarkItem[];
    setIsBookmarked(bookmarks.some((item) => item.id === app.id));
  }, [app.id]);

  const handleBookmarkClick = () => {
    const bookmarks = JSON.parse(
      localStorage.getItem("openstore-bookmarks") ?? "[]",
    ) as BookmarkItem[];

    if (isBookmarked) {
      const updated = bookmarks.filter((item) => item.id !== app.id);
      localStorage.setItem("openstore-bookmarks", JSON.stringify(updated));
      setIsBookmarked(false);
    } else {
      if (bookmarks.length >= 10) {
        alert("You can only bookmark up to 10 items.");
        return;
      }
      const bookmarkData = {
        id: app.id,
        title: app.name,
        description:
          app.oneLiner ?? app.shortDescription ?? app.description.slice(0, 100),
        category: app.category,
        stars: app.stars.toString(),
        forks: app.forks.toString(),
        lastCommit: formatLastCommit(app.lastCommit),
        bookmarkedAt: new Date().toISOString(),
        type: `${app.platform}-app`,
      } as unknown as BookmarkItem;
      bookmarks.push(bookmarkData);
      localStorage.setItem("openstore-bookmarks", JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const listPath =
    app.platform === "android" ? "/android-apps" : "/windows-apps";
  const listLabel =
    app.platform === "android" ? "Android Apps" : "Windows Apps";
  const gradientClass =
    app.platform === "android"
      ? "from-emerald-400 via-teal-400 to-cyan-400"
      : "from-blue-400 via-indigo-400 to-purple-400";

  const statItems = [
    {
      label: "Stars",
      value: formatCompactNumber(app.stars),
      Icon: Star,
      iconClass: "text-amber-400",
    },
    {
      label: "Forks",
      value: formatCompactNumber(app.forks),
      Icon: Download,
      iconClass: "text-green-400",
    },
    {
      label: "Last commit",
      value: formatLastCommit(app.lastCommit),
      Icon: Clock,
      iconClass: "text-green-400",
    },
    {
      label: "Age",
      value: calculateRepoAge(app.repositoryCreatedAt),
      Icon: Clock,
      iconClass: "text-purple-400",
    },
    {
      label: "License",
      value: app.license ?? "Not specified",
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
                <BreadcrumbLink href={listPath}>{listLabel}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{app.name}</BreadcrumbPage>
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
            <Link href={listPath}>
              <ArrowLeft className="h-4 w-4" />
              Back to {listLabel}
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {app.logo ? (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <Image
                      src={app.logo}
                      alt={app.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradientClass} text-2xl font-bold text-[#032119] uppercase shadow-sm`}
                  >
                    {app.name.slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
                      {app.name}
                    </h1>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm font-medium tracking-widest uppercase">
                    {app.category}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                {app.repositoryUrl && (
                  <Button className="gap-2" asChild>
                    <a
                      href={`${app.repositoryUrl}/releases/latest`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4" />
                      Install
                    </a>
                  </Button>
                )}
                {app.repositoryUrl && (
                  <Button variant="outline" className="gap-2" asChild>
                    <a
                      href={app.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4" />
                      View Source
                    </a>
                  </Button>
                )}
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
                content={app.description}
                className="text-muted-foreground leading-relaxed"
              />
            </div>

            {/* Categories, Tags & Built With */}
            <div className="space-y-8 border-t border-neutral-200 pt-8 dark:border-neutral-800">
              {/* Categories */}
              {app.categories.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-muted-foreground/70 text-sm font-semibold tracking-wider uppercase">
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {app.categories.map((cat) => (
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
              {app.tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-muted-foreground/70 text-sm font-semibold tracking-wider uppercase">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-2">
                    {app.tags.map((tag) => (
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
              {app.builtWith && app.builtWith.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-muted-foreground/70 text-sm font-semibold tracking-wider uppercase">
                    Built with
                  </h3>
                  <TechStack items={app.builtWith as TechItem[]} />
                </div>
              )}
            </div>

            {/* Share */}
            <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
              <ShareSection url={shareUrl} title={app.name} />
            </div>

            {/* Contributed by */}
            {app.user && (
              <div className="flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground font-medium">
                    Contributed by
                  </span>
                  <Link
                    href={app.user.username ? `/u/${app.user.username}` : "#"}
                    className="group/user hover:bg-muted/50 hover:border-border flex items-center gap-2 rounded-full border border-transparent p-1.5 pr-3 transition-colors"
                  >
                    {app.user.image ? (
                      <Image
                        src={app.user.image}
                        className="border-border h-8 w-8 rounded-full border shadow-sm transition-transform group-hover/user:scale-105"
                        alt={app.user.name ?? "User"}
                        width={32}
                        height={32}
                      />
                    ) : (
                      <div className="bg-primary/10 text-primary border-primary/20 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold">
                        {app.user.name?.[0] ??
                          app.user.username?.[0]?.toUpperCase() ??
                          "U"}
                      </div>
                    )}
                    <div className="flex flex-col -space-y-0.5">
                      {app.user.name && (
                        <span className="text-foreground group-hover/user:text-primary text-sm font-semibold transition-colors">
                          {app.user.name}
                        </span>
                      )}
                      <span
                        className={
                          app.user.name
                            ? "text-muted-foreground text-xs"
                            : "text-foreground group-hover/user:text-primary text-sm font-semibold"
                        }
                      >
                        {app.user.username
                          ? `@${app.user.username}`
                          : "Anonymous"}
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            )}
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

                {app.repositoryUrl && (
                  <Button
                    size="sm"
                    className="mt-4 w-full gap-2 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                    asChild
                  >
                    <a
                      href={app.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Repository
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Contributors */}
            <ContributorsCard
              contributors={contributors}
              repositoryUrl={app.repositoryUrl}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
