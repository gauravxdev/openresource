import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, Bookmark } from "lucide-react"
import type { WindowsApp } from "@/lib/windows-apps-data"

interface BookmarkItem {
  id: string | number
}

interface WindowsAppCardProps {
  app: WindowsApp
}

export const WindowsAppCard = ({ app }: WindowsAppCardProps) => {
  const [isBookmarked, setIsBookmarked] = React.useState(false)

  React.useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('openstore-bookmarks') ?? '[]') as BookmarkItem[]
    setIsBookmarked(bookmarks.some((item) => item.id === app.id))
  }, [app.id])

  const handleBookmarkClick = () => {
    const bookmarks = JSON.parse(localStorage.getItem('openstore-bookmarks') ?? '[]') as BookmarkItem[]

    if (isBookmarked) {
      const updatedBookmarks = bookmarks.filter((item) => item.id !== app.id)
      localStorage.setItem('openstore-bookmarks', JSON.stringify(updatedBookmarks))
      setIsBookmarked(false)
    } else {
      if (bookmarks.length >= 10) {
        alert('You can only bookmark up to 10 items. Please remove some bookmarks before adding more.')
        return
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
        type: 'windows-app',
        rating: app.rating
      }

      bookmarks.push(bookmarkData)
      localStorage.setItem('openstore-bookmarks', JSON.stringify(bookmarks))
      setIsBookmarked(true)
    }
  }
  return (
    <Card className="group relative h-full overflow-hidden rounded-[12px] border border-neutral-150 bg-transparent transition-all duration-200 hover:outline-[3px] hover:outline-neutral-200 dark:border-neutral-800 dark:hover:outline-neutral-800">
      <div className="pointer-events-none absolute inset-y-[1%] inset-x-[1%] rounded-[9px] bg-neutral-50 dark:bg-[#141414]" />
      <CardContent className="relative flex h-full flex-col gap-3 px-4 py-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            {app.logo ? (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[9px] overflow-hidden bg-white/10">
                <img src={app.logo} alt={app.title} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 text-lg font-semibold text-[#032119] uppercase">
                {app.title.slice(0, 1)}
              </div>
            )}
            <div className="space-y-1">
              <h3 className="text-[1.25rem] font-semibold leading-tight text-neutral-900 dark:text-card-foreground">
                {app.title}
              </h3>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500 dark:text-muted-foreground">
                {app.category}
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {app.repositoryUrl ? (
              <a href={app.repositoryUrl} target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5 text-white/70 hover:text-white hover:scale-110 transition-all cursor-pointer" />
              </a>
            ) : (
              <Github className="h-5 w-5 text-white/70 hover:text-white hover:scale-110 transition-all cursor-pointer" />
            )}
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
        </div>

        <p className="text-[0.95rem] leading-relaxed text-neutral-600 dark:text-muted-foreground">
          {app.description.length > 60 ? `${app.description.slice(0, 60)}...` : app.description}
        </p>

        {app.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {app.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 transition group-hover:bg-neutral-300 dark:group-hover:bg-neutral-700"
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
              <Button className="h-11 w-full rounded-lg bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 cursor-pointer">
                Install
              </Button>
            </a>
          ) : (
            <Button className="h-11 w-full rounded-lg bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100" disabled>
              Install
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
