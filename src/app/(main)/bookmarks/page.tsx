"use client";

import * as React from "react";
import { useSession } from "@/hooks/use-session";
import { getUserBookmarks, type BookmarkResource } from "@/actions/bookmarks";
import { ResourceCard } from "@/components/ResourceCard";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, Bookmark } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface LocalBookmarkItem {
  id: string | number;
  title: string;
  description: string;
  category: string;
  stars: string;
  forks: string;
  lastCommit: string;
  bookmarkedAt: string;
}

function getLocalBookmarks(): LocalBookmarkItem[] {
  try {
    return JSON.parse(
      localStorage.getItem("openstore-bookmarks") ?? "[]",
    ) as LocalBookmarkItem[];
  } catch {
    return [];
  }
}

export default function BookmarksPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const isLoggedIn = !!session?.user;

  const [dbBookmarks, setDbBookmarks] = React.useState<BookmarkResource[]>([]);
  const [localBookmarks, setLocalBookmarks] = React.useState<
    LocalBookmarkItem[]
  >([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (sessionLoading) return;

    if (isLoggedIn) {
      getUserBookmarks().then((result) => {
        if (result.success) {
          setDbBookmarks(result.data);
        }
        setLoading(false);
      });
    } else {
      setLocalBookmarks(getLocalBookmarks());
      setLoading(false);
    }
  }, [isLoggedIn, sessionLoading]);

  React.useEffect(() => {
    if (!isLoggedIn) {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === "openstore-bookmarks") {
          setLocalBookmarks(getLocalBookmarks());
        }
      };
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }
  }, [isLoggedIn]);

  if (loading || sessionLoading) {
    return (
      <div className="mx-auto max-w-[1152px] px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8 text-center md:mb-12 md:text-left">
          <h1 className="mb-3 text-3xl font-bold tracking-tight">
            Your Bookmarks
          </h1>
          <p className="text-muted-foreground text-lg">
            Loading your saved resources...
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-muted h-48 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const hasBookmarks = isLoggedIn
    ? dbBookmarks.length > 0
    : localBookmarks.length > 0;

  return (
    <div className="mx-auto max-w-[1152px] px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8 text-center md:mb-12 md:text-left">
        <div className="mb-3 flex items-center justify-center gap-3 md:justify-start">
          <Bookmark className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold tracking-tight">Your Bookmarks</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          {isLoggedIn
            ? "Your saved resources from the database."
            : "Your locally saved resources. Sign in to sync bookmarks across devices."}
        </p>
      </div>

      {!hasBookmarks ? (
        <Card className="border border-neutral-200 bg-neutral-100 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900/60">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
              <FolderOpen className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold">No bookmarks yet</h3>
            <p className="text-muted-foreground max-w-sm">
              Browse resources and click the bookmark icon to save them here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoggedIn
            ? dbBookmarks.map((resource) => (
                <div key={resource.id} className="h-full">
                  <ResourceCard
                    resource={{
                      id: resource.id,
                      slug: resource.slug,
                      title: resource.name,
                      description: resource.description,
                      shortDescription: resource.shortDescription,
                      oneLiner: resource.oneLiner,
                      alternative: resource.alternative,
                      category: resource.categories[0]?.name ?? "Uncategorized",
                      stars: resource.stars.toString(),
                      forks: resource.forks.toString(),
                      lastCommit: timeAgo(resource.lastCommit),
                      image: resource.image ?? "/api/placeholder/300/200",
                      logo: resource.logo,
                    }}
                  />
                </div>
              ))
            : localBookmarks.map((bookmark) => (
                <div key={String(bookmark.id)} className="h-full">
                  <ResourceCard
                    resource={{
                      id: bookmark.id,
                      slug: String(bookmark.id),
                      title: bookmark.title,
                      description: bookmark.description,
                      category: bookmark.category,
                      stars: bookmark.stars,
                      forks: bookmark.forks,
                      lastCommit: bookmark.lastCommit,
                      image: "/api/placeholder/300/200",
                    }}
                  />
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
