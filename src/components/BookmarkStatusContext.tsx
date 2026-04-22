"use client";

import * as React from "react";
import { checkBookmarkStatusBatch } from "@/actions/bookmarks";

interface BookmarkStatusContextValue {
  getBookmarkStatus: (resourceId: string) => boolean;
  preloadBookmarks: (resourceIds: string[]) => void;
}

const BookmarkStatusContext = React.createContext<BookmarkStatusContextValue>({
  getBookmarkStatus: () => false,
  preloadBookmarks: () => undefined,
});

export function useBookmarkStatus() {
  return React.useContext(BookmarkStatusContext);
}

interface BookmarkStatusProviderProps {
  children: React.ReactNode;
  initialBookmarkedIds?: Set<string>;
}

export function BookmarkStatusProvider({
  children,
  initialBookmarkedIds = new Set(),
}: BookmarkStatusProviderProps) {
  const [bookmarkedIds, setBookmarkedIds] =
    React.useState<Set<string>>(initialBookmarkedIds);
  const [pendingIds, setPendingIds] = React.useState<Set<string>>(new Set());
  const hasInitialized = React.useRef(false);

  React.useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (pendingIds.size > 0) {
      const idsToFetch = Array.from(pendingIds).filter(
        (id) => !bookmarkedIds.has(id),
      );
      if (idsToFetch.length === 0) {
        setPendingIds(new Set());
        return;
      }

      setPendingIds(new Set());

      void checkBookmarkStatusBatch(idsToFetch).then((result) => {
        if (result.success) {
          setBookmarkedIds(
            (prev) => new Set([...prev, ...result.bookmarkedIds]),
          );
        }
      });
    }
  }, [pendingIds, bookmarkedIds]);

  const getBookmarkStatus = React.useCallback(
    (resourceId: string) => {
      if (bookmarkedIds.has(resourceId)) {
        return true;
      }
      if (!pendingIds.has(resourceId)) {
        setPendingIds((prev) => new Set([...prev, resourceId]));
      }
      return false;
    },
    [bookmarkedIds, pendingIds],
  );

  const preloadBookmarks = React.useCallback(
    (resourceIds: string[]) => {
      const idsToFetch = resourceIds.filter((id) => !bookmarkedIds.has(id));
      if (idsToFetch.length === 0) return;

      setPendingIds((prev) => new Set([...prev, ...idsToFetch]));
    },
    [bookmarkedIds],
  );

  return (
    <BookmarkStatusContext.Provider
      value={{ getBookmarkStatus, preloadBookmarks }}
    >
      {children}
    </BookmarkStatusContext.Provider>
  );
}
