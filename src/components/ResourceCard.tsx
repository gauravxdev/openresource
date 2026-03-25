import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Star, GitFork, Clock, Box } from "lucide-react";
import Image from "next/image";
import { BookmarkButton } from "@/components/BookmarkButton";

interface Resource {
  id: number | string;
  slug: string;
  title: string;
  description: string;
  shortDescription?: string | null;
  oneLiner?: string | null;
  alternative?: string | null;
  category: string;
  stars: string;
  forks: string;
  lastCommit: string;
  image: string;
  logo?: string | null;
}

interface ResourceCardProps {
  resource: Resource;
}

const MAX_HOVER_DESCRIPTION_LENGTH = 150;

export function ResourceCard({ resource }: ResourceCardProps) {
  const stats = [
    {
      label: "Stars",
      value: resource.stars,
      Icon: Star,
      iconClassName: "text-yellow-400",
    },
    {
      label: "Forks",
      value: resource.forks,
      Icon: GitFork,
      iconClassName: "text-neutral-400",
    },
    {
      label: "Last commit",
      value: resource.lastCommit,
      Icon: Clock,
      iconClassName: "text-neutral-400",
    },
  ] as const;

  const hoverDescription = resource.shortDescription ?? resource.description;
  const truncatedHoverDescription =
    hoverDescription.length > MAX_HOVER_DESCRIPTION_LENGTH
      ? hoverDescription.slice(0, MAX_HOVER_DESCRIPTION_LENGTH) + "..."
      : hoverDescription;

  return (
    <Link
      href={`/resource/${resource.slug}`}
      className="block h-full"
      prefetch={false}
    >
      <Card className="group border-neutral-150 relative flex h-full flex-col gap-0 overflow-hidden rounded-[12px] border bg-transparent p-0 transition-all duration-200 hover:outline-[3px] hover:outline-neutral-200 dark:border-neutral-800 dark:hover:outline-neutral-800">
        <div className="pointer-events-none absolute inset-[2px] rounded-[10px] bg-neutral-50 dark:bg-[#141414]" />
        <CardContent className="relative flex h-full flex-col p-4">
          <div className="flex items-center gap-3">
            {resource.logo ? (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-neutral-100 dark:bg-neutral-800">
                <Image
                  src={resource.logo}
                  alt={resource.title}
                  width={32}
                  height={32}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-sm font-semibold text-white uppercase">
                {resource.title.slice(0, 1)}
              </div>
            )}
            <div className="flex flex-1 items-center">
              <h2 className="dark:text-card-foreground text-[1.25rem] leading-tight font-semibold text-neutral-900">
                {resource.title}
              </h2>
            </div>
            <BookmarkButton
              resource={{
                id: resource.id,
                slug: resource.slug,
                title: resource.title,
                description: resource.description,
                category: resource.category,
                stars: resource.stars,
                forks: resource.forks,
                lastCommit: resource.lastCommit,
                image: resource.image,
                logo: resource.logo,
              }}
            />
          </div>

          <div className="relative mt-2 flex-1 overflow-hidden">
            {/* Normal State */}
            <div className="flex h-full flex-col transition-all duration-300 group-hover:-translate-y-2 group-hover:opacity-0">
              <div className="flex-1">
                <p className="dark:text-muted-foreground line-clamp-2 text-[0.95rem] leading-relaxed text-neutral-600">
                  {resource.oneLiner ??
                    resource.shortDescription ??
                    resource.description}
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-1.5 border-t border-neutral-100 pt-3 text-sm dark:border-neutral-800/50">
                {stats.map(({ label, value, Icon, iconClassName }) => (
                  <div
                    key={label}
                    className="dark:text-muted-foreground flex items-center gap-3 text-neutral-500"
                  >
                    <div className="flex flex-1 items-center gap-2">
                      <Icon
                        className={`h-3.5 w-3.5 flex-shrink-0 ${iconClassName}`}
                      />
                      <span className="dark:text-muted-foreground text-[11px] tracking-[0.2em] whitespace-nowrap text-neutral-500 uppercase">
                        {label}
                      </span>
                      <div className="dark:bg-border/70 mx-1 h-px min-w-[20px] flex-1 rounded-full bg-neutral-200" />
                    </div>
                    <span className="dark:text-card-foreground font-mono text-[13px] font-semibold whitespace-nowrap text-neutral-900">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hover State Overlay */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex h-full translate-y-4 flex-col bg-transparent opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <div className="flex-1">
                <p className="dark:text-muted-foreground line-clamp-3 text-[0.95rem] leading-relaxed text-neutral-600">
                  {truncatedHoverDescription}
                </p>
              </div>

              {resource.alternative ? (
                <div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3 text-sm dark:border-neutral-800/50">
                  <span className="dark:text-muted-foreground text-neutral-500">
                    Alternative to:
                  </span>
                  <div className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-1 dark:border-neutral-700/50 dark:bg-neutral-800/50">
                    <Box className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="text-[0.85rem] font-medium text-neutral-900 dark:text-neutral-200">
                      {resource.alternative}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="pointer-events-none mt-3 flex items-center gap-2 pt-3 text-sm opacity-0">
                  <span className="dark:text-muted-foreground text-neutral-500">
                    Alternative
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
