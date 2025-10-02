"use client"

import * as React from "react"
import { SearchFilters } from "./SearchFilters"
import { ResourceCard } from "./ResourceCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination-wrapper"
import { Separator } from "@/components/ui/separator"
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
  },
  {
    id: 7,
    title: "Supabase",
    description: "Open source Firebase alternative with instant APIs",
    category: "database",
    stars: "45,231",
    forks: "3,456",
    lastCommit: "3 days ago",
    image: "/api/placeholder/300/200"
  },
  {
    id: 8,
    title: "Vercel",
    description: "Frontend cloud platform for static sites and serverless functions",
    category: "deployment",
    stars: "89,123",
    forks: "12,789",
    lastCommit: "1 day ago",
    image: "/api/placeholder/300/200"
  },
  {
    id: 9,
    title: "Next.js",
    description: "React framework for production with built-in optimizations",
    category: "framework",
    stars: "234,567",
    forks: "45,678",
    lastCommit: "2 days ago",
    image: "/api/placeholder/300/200"
  },
  {
    id: 10,
    title: "Tailwind CSS",
    description: "Utility-first CSS framework for rapid UI development",
    category: "styling",
    stars: "156,789",
    forks: "23,456",
    lastCommit: "4 days ago",
    image: "/api/placeholder/300/200"
  },
  {
    id: 11,
    title: "React Query",
    description: "Powerful data synchronization for React applications",
    category: "data fetching",
    stars: "98,765",
    forks: "8,901",
    lastCommit: "1 day ago",
    image: "/api/placeholder/300/200"
  },
  {
    id: 12,
    title: "Zustand",
    description: "Small, fast and scalable state management solution",
    category: "state management",
    stars: "67,890",
    forks: "5,432",
    lastCommit: "3 days ago",
    image: "/api/placeholder/300/200"
  }
]

const MainContainer = () => {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 9 // 3x3 grid

  const filteredResources = React.useMemo(() => {
    const filtered = mockResources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Reset to first page when filters change
    if (currentPage > Math.ceil(filtered.length / itemsPerPage)) {
      setCurrentPage(1)
    }

    return filtered
  }, [searchTerm, selectedCategory, currentPage])

  // Calculate pagination
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedResources = filteredResources.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const categories = ["all", ...Array.from(new Set(mockResources.map(r => r.category)))]

  return (
    <div className="w-full bg-background min-h-screen">
      <Separator />
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
            {paginatedResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <Card className="border border-neutral-200 bg-neutral-100 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900/60">
            <CardContent className="flex flex-col items-center gap-4">
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                No resources found matching your criteria.
              </p>
              <Button
                variant="outline"
                className="rounded-full border-neutral-300 bg-neutral-200 px-5 text-sm text-neutral-700 hover:bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-200 dark:hover:bg-neutral-800"
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

        {/* Pagination - Always at bottom */}
        {filteredResources.length > 0 && totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default MainContainer