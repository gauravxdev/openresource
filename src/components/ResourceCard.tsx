"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, GitFork, Clock, Bookmark, Box } from "lucide-react"

interface BookmarkItem {
  id: string | number
}

interface Resource {
  id: number | string
  slug: string
  title: string
  description: string
  shortDescription?: string | null
  oneLiner?: string | null
  alternative?: string | null
  category: string
  stars: string
  forks: string
  lastCommit: string
  image: string
  logo?: string | null
}

interface ResourceCardProps {
  resource: Resource
}

export const ResourceCard = ({ resource }: ResourceCardProps) => {
  const [isBookmarked, setIsBookmarked] = React.useState(false)

  // Check if resource is already bookmarked on component mount
  React.useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('openstore-bookmarks') ?? '[]') as BookmarkItem[]
    setIsBookmarked(bookmarks.some((item) => item.id === resource.id))
  }, [resource.id])

  const handleBookmarkClick = () => {
    const bookmarks = JSON.parse(localStorage.getItem('openstore-bookmarks') ?? '[]') as BookmarkItem[]

    if (isBookmarked) {
      // Remove bookmark
      const updatedBookmarks = bookmarks.filter((item) => item.id !== resource.id)
      localStorage.setItem('openstore-bookmarks', JSON.stringify(updatedBookmarks))
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
      setIsBookmarked(true)
    }
  }

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
  ] as const

  return (
    <Link href={`/resource/${resource.slug}`} className="block h-full">
      <Card className="group relative h-full flex flex-col p-0 gap-0 overflow-hidden rounded-[12px] border border-neutral-150 bg-transparent transition-all duration-200 hover:outline-[3px] hover:outline-neutral-200 dark:border-neutral-800 dark:hover:outline-neutral-800">
        <div className="pointer-events-none absolute inset-[2px] rounded-[10px] bg-neutral-50 dark:bg-[#141414]" />
        <CardContent className="relative flex h-full flex-col p-4">
          <div className="flex items-center gap-3">
            {resource.logo ? (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <img src={resource.logo} alt={resource.title} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-sm font-semibold text-white uppercase">
                {resource.title.slice(0, 1)}
              </div>
            )}
            <div className="flex flex-1 items-center">
              <h3 className="text-[1.25rem] font-semibold leading-tight text-neutral-900 dark:text-card-foreground">
                {resource.title}
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={`shrink-0 border-border hover:bg-accent ${isBookmarked ? 'bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                handleBookmarkClick()
              }}
              title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>

          <div className="relative mt-2 flex-1 overflow-hidden">
            {/* Normal State */}
            <div className="flex h-full flex-col transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-2">
              <div className="flex-1">
                <p className="text-[0.95rem] leading-relaxed text-neutral-600 dark:text-muted-foreground line-clamp-2">
                  {resource.oneLiner ?? resource.shortDescription ?? resource.description}
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-1.5 text-sm border-t border-neutral-100 dark:border-neutral-800/50 pt-3">
                {stats.map(({ label, value, Icon, iconClassName }) => (
                  <div key={label} className="flex items-center gap-3 text-neutral-500 dark:text-muted-foreground">
                    <div className="flex flex-1 items-center gap-2">
                      <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${iconClassName}`} />
                      <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 dark:text-muted-foreground whitespace-nowrap">{label}</span>
                      <div className="h-px flex-1 rounded-full bg-neutral-200 dark:bg-border/70 min-w-[20px] mx-1" />
                    </div>
                    <span className="font-mono text-[13px] font-semibold text-neutral-900 dark:text-card-foreground whitespace-nowrap">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hover State Overlay */}
            <div className="absolute inset-x-0 top-0 flex h-full flex-col translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 bg-transparent pointer-events-none">
              <div className="flex-1">
                <p className="text-[0.95rem] leading-relaxed text-neutral-600 dark:text-muted-foreground line-clamp-5">
                  {resource.shortDescription ?? resource.description}
                </p>
              </div>

              {resource.alternative ? (
                <div className="mt-3 flex items-center gap-2 text-sm pt-3 border-t border-neutral-100 dark:border-neutral-800/50">
                  <span className="text-neutral-500 dark:text-muted-foreground">Alternative to:</span>
                  <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800/50 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-700/50">
                    <Box className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="font-medium text-[0.85rem] text-neutral-900 dark:text-neutral-200">{resource.alternative}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2 text-sm pt-3 pointer-events-none opacity-0">
                  <span className="text-neutral-500 dark:text-muted-foreground">Alternative</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
