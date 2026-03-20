"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"

interface BookmarkItem {
  id: string | number
}

// Module-level bookmark cache to avoid redundant localStorage reads across multiple cards
let bookmarkCache: BookmarkItem[] | null = null
let bookmarkCacheTimestamp = 0

function getBookmarks(): BookmarkItem[] {
  const now = Date.now()
  // Re-read from localStorage at most once per second
  if (!bookmarkCache || now - bookmarkCacheTimestamp > 1000) {
    try {
      bookmarkCache = JSON.parse(localStorage.getItem('openstore-bookmarks') ?? '[]') as BookmarkItem[]
    } catch {
      bookmarkCache = []
    }
    bookmarkCacheTimestamp = now
  }
  return bookmarkCache
}

function invalidateBookmarkCache() {
  bookmarkCache = null
}

interface BookmarkButtonProps {
  resource: {
    id: number | string
    title: string
    description: string
    category: string
    stars: string
    forks: string
    lastCommit: string
  }
}

export function BookmarkButton({ resource }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = React.useState(false)

  // Check if resource is already bookmarked on component mount (using shared cache)
  React.useEffect(() => {
    const bookmarks = getBookmarks()
    setIsBookmarked(bookmarks.some((item) => item.id === resource.id))
  }, [resource.id])

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const bookmarks = getBookmarks()

    if (isBookmarked) {
      // Remove bookmark
      const updatedBookmarks = bookmarks.filter((item) => item.id !== resource.id)
      localStorage.setItem('openstore-bookmarks', JSON.stringify(updatedBookmarks))
      invalidateBookmarkCache()
      setIsBookmarked(false)
    } else {
      // Add bookmark (check limit first)
      if (bookmarks.length >= 10) {
        alert('You can only bookmark up to 10 items. Please remove some bookmarks before adding more.')
        return
      }

      const bookmarkData = {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        category: resource.category,
        stars: resource.stars,
        forks: resource.forks,
        lastCommit: resource.lastCommit,
        bookmarkedAt: new Date().toISOString()
      }

      bookmarks.push(bookmarkData)
      localStorage.setItem('openstore-bookmarks', JSON.stringify(bookmarks))
      invalidateBookmarkCache()
      setIsBookmarked(true)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={`shrink-0 border-border hover:bg-accent ${isBookmarked ? 'bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500' : ''}`}
      onClick={handleBookmarkClick}
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
    </Button>
  )
}
