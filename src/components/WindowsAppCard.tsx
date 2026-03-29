import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Bookmark } from "lucide-react";
import type { WindowsApp } from "@/lib/windows-apps-data";
import NextImage from "next/image";

interface BookmarkItem {
  id: string | number;
}

interface WindowsAppCardProps {
  app: WindowsApp;
}

export const WindowsAppCard = ({ app }: WindowsAppCardProps) => {
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
      const updatedBookmarks = bookmarks.filter((item) => item.id !== app.id);
      localStorage.setItem(
        "openstore-bookmarks",
        JSON.stringify(updatedBookmarks),
      );
      setIsBookmarked(false);
    } else {
      if (bookmarks.length >= 10) {
        alert(
          "You can only bookmark up to 10 items. Please remove some bookmarks before adding more.",
        );
        return;
      }

      const bookmarkData = {
        id: app.id,
        title: app.title,
        description: app.description,
        category: app.category,
        stars: app.stars,
        forks: app.downloads,
        lastCommit: app.lastUpdated,
        bookmarkedAt: new Date().toISOString(),
        type: "windows-app",
        rating: app.rating,
      };

      bookmarks.push(bookmarkData);
      localStorage.setItem("openstore-bookmarks", JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  const detailHref = app.slug ? `/windows-apps/${app.slug}` : null;

  return (
    <Card className="group border-neutral-150 relative h-full overflow-hidden rounded-[12px] border bg-transparent transition-all duration-200 hover:outline-[3px] hover:outline-neutral-200 dark:border-neutral-800 dark:hover:outline-neutral-800">
      <div className="pointer-events-none absolute inset-x-[1%] inset-y-[1%] rounded-[9px] bg-neutral-50 dark:bg-[#141414]" />
      <CardContent className="relative flex h-full flex-col gap-3 px-4 py-2">
        <div className="flex items-start justify-between gap-3">
          {detailHref ? (
            <Link
              href={detailHref}
              className="flex min-w-0 flex-1 items-center gap-4"
            >
              {app.logo ? (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-white/10">
                  <NextImage
                    src={app.logo}
                    alt={app.title}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 text-lg font-semibold text-[#032119] uppercase">
                  {app.title.slice(0, 1)}
                </div>
              )}
              <div className="space-y-1">
                <h3 className="dark:text-card-foreground text-[1.25rem] leading-tight font-semibold text-neutral-900 transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  {app.title}
                </h3>
                <p className="dark:text-muted-foreground text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">
                  {app.category}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-4">
              {app.logo ? (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-white/10">
                  <NextImage
                    src={app.logo}
                    alt={app.title}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 text-lg font-semibold text-[#032119] uppercase">
                  {app.title.slice(0, 1)}
                </div>
              )}
              <div className="space-y-1">
                <h3 className="dark:text-card-foreground text-[1.25rem] leading-tight font-semibold text-neutral-900">
                  {app.title}
                </h3>
                <p className="dark:text-muted-foreground text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">
                  {app.category}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            {app.repositoryUrl ? (
              <a
                href={app.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5 cursor-pointer text-white/70 transition-all hover:scale-110 hover:text-white" />
              </a>
            ) : (
              <Github className="h-5 w-5 cursor-pointer text-white/70 transition-all hover:scale-110 hover:text-white" />
            )}
            <Button
              variant="outline"
              size="sm"
              className={`border-border hover:bg-accent shrink-0 ${isBookmarked ? "border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                handleBookmarkClick();
              }}
              title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              <Bookmark
                className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
              />
            </Button>
          </div>
        </div>

        {detailHref ? (
          <Link href={detailHref}>
            <p className="dark:text-muted-foreground hover:text-foreground text-[0.95rem] leading-relaxed text-neutral-600 transition-colors">
              {app.description.length > 60
                ? `${app.description.slice(0, 60)}...`
                : app.description}
            </p>
          </Link>
        ) : (
          <p className="dark:text-muted-foreground text-[0.95rem] leading-relaxed text-neutral-600">
            {app.description.length > 60
              ? `${app.description.slice(0, 60)}...`
              : app.description}
          </p>
        )}

        {app.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {app.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 transition group-hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:bg-neutral-700"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto pt-2">
          {app.repositoryUrl ? (
            <a
              href={`${app.repositoryUrl}/releases/latest`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button className="h-11 w-full cursor-pointer rounded-lg bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100">
                Install
              </Button>
            </a>
          ) : (
            <Button
              className="h-11 w-full rounded-lg bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
              disabled
            >
              Install
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
