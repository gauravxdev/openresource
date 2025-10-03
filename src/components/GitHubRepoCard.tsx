import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, GitFork, Calendar, ExternalLink } from "lucide-react"

interface GitHubRepoCardProps {
  name: string
  description: string
  language: string
  stars: number
  forks: number
  updatedAt: string
  url: string
}

export function GitHubRepoCard({
  name,
  description,
  language,
  stars,
  forks,
  updatedAt,
  url
}: GitHubRepoCardProps) {
  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow duration-200 bg-background border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
              {name}
            </CardTitle>
            <CardDescription className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {description}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-2 shrink-0 border-border hover:bg-accent"
            asChild
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs bg-secondary/50">
              {language}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
              <span>{stars.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-1">
              <GitFork className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <span>{forks.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-green-500 dark:text-green-400" />
              <span>{new Date(updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
