import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, GitFork, ExternalLink, Bookmark } from "lucide-react";
import * as React from "react";
import Link from "next/link";
import { formatCompactNumber } from "@/lib/format";

interface BookmarkItem {
  id: string | number;
}

interface GitHubRepoCardProps {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
  slug: string;
}

export const GitHubRepoCard = React.memo(function GitHubRepoCard({
  name,
  description,
  language,
  stars,
  forks,
  url,
  slug,
}: GitHubRepoCardProps) {
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  React.useEffect(() => {
    const bookmarks = JSON.parse(
      localStorage.getItem("openstore-bookmarks") ?? "[]",
    ) as BookmarkItem[];
    setIsBookmarked(bookmarks.some((item) => item.id === name));
  }, [name]);

  const handleBookmarkClick = () => {
    const bookmarks = JSON.parse(
      localStorage.getItem("openstore-bookmarks") ?? "[]",
    ) as BookmarkItem[];

    if (isBookmarked) {
      const updatedBookmarks = bookmarks.filter((item) => item.id !== name);
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
        id: name,
        title: name,
        description: description,
        category: language,
        stars: stars.toString(),
        forks: forks.toString(),
        lastCommit: "N/A",
        bookmarkedAt: new Date().toISOString(),
        type: "github-repo",
        url: url,
      };

      bookmarks.push(bookmarkData);
      localStorage.setItem("openstore-bookmarks", JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  return (
    <Card className="bg-background border-border w-full transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link href={`/github-repos/${slug}`}>
              <CardTitle className="mb-2 cursor-pointer text-lg font-semibold break-words text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                {name}
              </CardTitle>
            </Link>
            <div className="text-muted-foreground line-clamp-3 text-sm">
              <Link href={`/github-repos/${slug}`}>
                <p className="hover:text-foreground transition-colors">
                  {description ||
                    "A comprehensive open source project with modern development practices and community contributions."}
                </p>
              </Link>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`border-border hover:bg-accent mt-1 shrink-0 ${isBookmarked ? "bg-black text-white border-black hover:bg-neutral-800 hover:text-white dark:bg-white dark:text-black dark:border-white dark:hover:bg-neutral-200 dark:hover:text-black" : ""}`}
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
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-accent mt-1 shrink-0"
              asChild
            >
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Link href={`/github-repos/${slug}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-secondary/50 shrink-0 text-xs"
              >
                {language}
              </Badge>
            </div>

            <div className="text-muted-foreground flex shrink-0 items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 shrink-0 text-yellow-500 dark:text-yellow-400" />
                <span className="whitespace-nowrap">
                  {formatCompactNumber(stars)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <GitFork className="h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" />
                <span className="whitespace-nowrap">
                  {formatCompactNumber(forks)}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
});
