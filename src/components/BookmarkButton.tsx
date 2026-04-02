"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { toggleBookmark, checkBookmarkStatus } from "@/actions/bookmarks";

interface BookmarkItem {
  id: string | number;
}

let bookmarkCache: BookmarkItem[] | null = null;
let bookmarkCacheTimestamp = 0;

function getLocalBookmarks(): BookmarkItem[] {
  const now = Date.now();
  if (!bookmarkCache || now - bookmarkCacheTimestamp > 1000) {
    try {
      bookmarkCache = JSON.parse(
        localStorage.getItem("openstore-bookmarks") ?? "[]",
      ) as BookmarkItem[];
    } catch {
      bookmarkCache = [];
    }
    bookmarkCacheTimestamp = now;
  }
  return bookmarkCache;
}

function invalidateBookmarkCache() {
  bookmarkCache = null;
}

interface BookmarkButtonProps {
  resource: {
    id: number | string;
    slug: string;
    title: string;
    description: string;
    category: string;
    stars: string;
    forks: string;
    lastCommit: string;
    image?: string;
    logo?: string | null;
  };
  className?: string;
  showLabel?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
}

export function BookmarkButton({ 
  resource, 
  className, 
  showLabel = false,
  size = "sm"
}: BookmarkButtonProps) {
  const { data: session, isPending: sessionLoading } = useSession();
  const isLoggedIn = !!session?.user;
  const resourceId = String(resource.id);

  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    if (isLoggedIn) {
      void checkBookmarkStatus(resourceId).then((result) => {
        if (result.success) {
          setIsBookmarked(result.bookmarked);
        }
      });
    } else {
      const bookmarks = getLocalBookmarks();
      setIsBookmarked(bookmarks.some((item) => String(item.id) === resourceId));
    }
  }, [resourceId, isLoggedIn]);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!mounted || loading) return;

    if (isLoggedIn) {
      setLoading(true);
      try {
        const result = await toggleBookmark(resourceId);
        if (result.success) {
          setIsBookmarked(result.bookmarked);
        }
      } finally {
        setLoading(false);
      }
    } else {
      const bookmarks = getLocalBookmarks();

      if (isBookmarked) {
        const updatedBookmarks = bookmarks.filter(
          (item) => String(item.id) !== resourceId,
        );
        localStorage.setItem(
          "openstore-bookmarks",
          JSON.stringify(updatedBookmarks),
        );
        invalidateBookmarkCache();
        setIsBookmarked(false);
      } else {
        if (bookmarks.length >= 10) {
          alert(
            "You can only bookmark up to 10 items. Please remove some bookmarks before adding more.",
          );
          return;
        }

        const bookmarkData = {
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
          bookmarkedAt: new Date().toISOString(),
        };

        bookmarks.push(bookmarkData);
        localStorage.setItem("openstore-bookmarks", JSON.stringify(bookmarks));
        invalidateBookmarkCache();
        setIsBookmarked(true);
      }
    }
  };

  if (!mounted || sessionLoading) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`border-border shrink-0 cursor-wait opacity-50 ${className ?? ""}`}
        disabled
      >
        <Bookmark className="h-4 w-4" />
        {showLabel && <span className="ml-2">Bookmark</span>}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      className={`border-border hover:bg-accent shrink-0 ${isBookmarked ? "bg-black text-white border-black hover:bg-neutral-800 hover:text-white dark:bg-white dark:text-black dark:border-white dark:hover:bg-neutral-200 dark:hover:text-black" : ""} ${className ?? ""}`}
      onClick={handleBookmarkClick}
      disabled={loading}
      title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
      {showLabel && (
        <span className="ml-2">
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </span>
      )}
    </Button>
  );
}
