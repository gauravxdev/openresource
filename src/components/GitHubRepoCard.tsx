import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, GitFork, ExternalLink, Bookmark } from "lucide-react"
import * as React from "react"

interface GitHubRepoCardProps {
  name: string
  description: string
  language: string
  stars: number
  forks: number
  url: string
}

export function GitHubRepoCard({
  name,
  description,
  language,
  stars,
  forks,
  url
}: GitHubRepoCardProps) {
  const [isBookmarked, setIsBookmarked] = React.useState(false)

  // Check if repo is already bookmarked on component mount
  React.useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('openstore-bookmarks') || '[]')
    setIsBookmarked(bookmarks.some((item: any) => item.id === name))
  }, [name])

  const handleBookmarkClick = () => {
    const bookmarks = JSON.parse(localStorage.getItem('openstore-bookmarks') || '[]')

    if (isBookmarked) {
      // Remove bookmark
      const updatedBookmarks = bookmarks.filter((item: any) => item.id !== name)
      localStorage.setItem('openstore-bookmarks', JSON.stringify(updatedBookmarks))
      setIsBookmarked(false)
    } else {
      // Add bookmark (check limit first)
      if (bookmarks.length >= 10) {
        alert('You can only bookmark up to 10 items. Please remove some bookmarks before adding more.')
        return
      }

      const bookmarkData = {
        id: name,
        title: name,
        description: description,
        category: language,
        stars: stars.toString(),
        forks: forks.toString(),
        lastCommit: 'N/A',
        bookmarkedAt: new Date().toISOString(),
        type: 'github-repo',
        url: url
      }

      bookmarks.push(bookmarkData)
      localStorage.setItem('openstore-bookmarks', JSON.stringify(bookmarks))
      setIsBookmarked(true)
    }
  }
  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200 bg-background border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mb-2 break-words">
              {name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-3">
              {description || "A comprehensive open source project with modern development practices and community contributions."}
            </CardDescription>
          </div>
          <div className="flex gap-2 shrink-0">
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
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-border hover:bg-accent mt-1"
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
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="secondary" className="text-xs bg-secondary/50 shrink-0">
              {language}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 dark:text-yellow-400 shrink-0" />
              <span className="whitespace-nowrap">{stars.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-1">
              <GitFork className="h-4 w-4 text-blue-500 dark:text-blue-400 shrink-0" />
              <span className="whitespace-nowrap">{forks.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
