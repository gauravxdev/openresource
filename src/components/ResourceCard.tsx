"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, GitFork, Clock, Bookmark } from "lucide-react"

interface Resource {
  id: number
  title: string
  description: string
  category: string
  stars: string
  forks: string
  lastCommit: string
  image: string
}

interface ResourceCardProps {
  resource: Resource
}

export const ResourceCard = ({ resource }: ResourceCardProps) => {
  const [isBookmarked, setIsBookmarked] = React.useState(false)

  // Check if resource is already bookmarked on component mount
  React.useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('openstore-bookmarks') || '[]')
    setIsBookmarked(bookmarks.some((item: any) => item.id === resource.id))
  }, [resource.id])

  const handleBookmarkClick = () => {
    const bookmarks = JSON.parse(localStorage.getItem('openstore-bookmarks') || '[]')

    if (isBookmarked) {
      // Remove bookmark
      const updatedBookmarks = bookmarks.filter((item: any) => item.id !== resource.id)
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
    <Card className="group relative h-full overflow-hidden rounded-[12px] border border-neutral-150 bg-transparent transition-all duration-200 hover:outline-[3px] hover:outline-neutral-200 dark:border-neutral-800 dark:hover:outline-neutral-800">
      <div className="pointer-events-none absolute inset-y-[2%] inset-x-[1%] rounded-[9px] bg-neutral-50 dark:bg-[#141414]" />
      <CardContent className="relative flex h-full flex-col px-5 py-1.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-sm font-semibold text-white uppercase">
            {resource.title.slice(0, 1)}
          </div>
          <div className="flex flex-1 items-center">
            <h3 className="text-[1.25rem] font-semibold leading-tight text-neutral-900 dark:text-card-foreground">
              {resource.title}
            </h3>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              handleBookmarkClick()
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
              isBookmarked
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-500 dark:hover:bg-neutral-700'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        <p className="text-[0.95rem] leading-relaxed text-neutral-600 dark:text-muted-foreground mt-3">
          {resource.description}
        </p>

        <div className="mt-2 flex flex-col gap-2 text-sm">
          {stats.map(({ label, value, Icon, iconClassName }) => (
            <div key={label} className="flex items-center gap-3 text-neutral-500 dark:text-muted-foreground">
              <div className="flex flex-1 items-center gap-2">
                <Icon className={`h-4 w-4 ${iconClassName}`} />
                <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 dark:text-muted-foreground">{label}</span>
                <div className="h-px flex-1 rounded-full bg-neutral-200 dark:bg-border/70" />
              </div>
              <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-card-foreground">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}