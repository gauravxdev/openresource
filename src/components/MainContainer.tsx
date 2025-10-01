"use client"

import * as React from "react"
import { SearchFilters } from "./SearchFilters"
import { ResourceCard } from "./ResourceCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Mock data for demonstration
const mockResources = [
  {
    id: 1,
    title: "Tolgee",
    description: "Effortless localization for modern web applications",
    category: "in seconds",
    stars: "11,891",
    forks: "798",
    lastCommit: "2 days ago",
    image: "/api/placeholder/300/200"
  },
  {
    id: 2,
    title: "Postiz",
    description: "AI-powered social media management platform",
    category: "user insights",
    stars: "176",
    forks: "12",
    lastCommit: "2 days ago",
    image: "/api/placeholder/300/200"
  },
  {
    id: 3,
    title: "n8n",
    description: "AI-powered workflow automation for technical teams",
    category: "notification platform",
    stars: "37,921",
    forks: "4,124",
    lastCommit: "1 day ago",
    image: "/api/placeholder/300/200"
  },
  {
    id: 4,
    title: "Open WebUI",
    description: "Extensible, self-hosted AI interface for your workflow",
    category: "AI interface",
    stars: "111,287",
    forks: "15,337",
    lastCommit: "1 day ago",
    image: "/api/placeholder/300/200"
  },
  {
    id: 5,
    title: "Dify",
    description: "AI-powered app creation without coding complexities",
    category: "app creation",
    stars: "115,494",
    forks: "17,806",
    lastCommit: "1 day ago",
    image: "/api/placeholder/300/200"
  },
  {
    id: 6,
    title: "Langflow",
    description: "Visual builder for AI-powered applications and workflows",
    category: "visual builder",
    stars: "125,345",
    forks: "7,702",
    lastCommit: "1 day ago",
    image: "/api/placeholder/300/200"
  }
]

const MainContainer = () => {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const [filteredResources, setFilteredResources] = React.useState(mockResources)

  React.useEffect(() => {
    const filtered = mockResources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    setFilteredResources(filtered)
  }, [searchTerm, selectedCategory])

  const categories = ["all", ...Array.from(new Set(mockResources.map(r => r.category)))]

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Main content container with same width as navbar */}
      <div className="mx-auto max-w-[1152px] px-5 pb-20 pt-8 md:px-6 md:pt-12">
        {/* Search and Filters */}
        <SearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-400 text-sm">
            Showing {filteredResources.length} of {mockResources.length} resources
          </p>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-gray-800/80 text-gray-300 border-gray-700/50">
              {selectedCategory === "all" ? "All" : selectedCategory}
            </Badge>
            {searchTerm && (
              <Badge variant="outline" className="border-gray-700/50 text-gray-400">
                "{searchTerm}"
              </Badge>
            )}
          </div>
        </div>

        {/* Resource Cards Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <Card className="border border-neutral-800 bg-neutral-900/60 p-8 text-center">
            <CardContent className="flex flex-col items-center gap-4">
              <p className="text-lg text-neutral-400">
                No resources found matching your criteria.
              </p>
              <Button
                variant="outline"
                className="rounded-full border-neutral-700 bg-neutral-900/70 px-5 text-sm text-neutral-200 hover:bg-neutral-800"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default MainContainer