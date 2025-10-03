import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, GitFork, ExternalLink } from "lucide-react"

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
