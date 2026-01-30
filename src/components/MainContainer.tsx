"use client"

import * as React from "react"
import { SearchFilters } from "./SearchFilters"
import { ResourceCard } from "./ResourceCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination-wrapper"
import { Separator } from "@/components/ui/separator"
import { timeAgo } from "@/lib/utils"
import type { ResourceWithCategories } from "@/actions/resources"

interface MainContainerProps {
  initialResources: ResourceWithCategories[];
}

const MainContainer = ({ initialResources = [] }: MainContainerProps) => {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 9 // 3x3 grid

  // Extract all unique categories from resources
  const categories = React.useMemo(() => {
    const allCategories = new Set<string>();
    initialResources.forEach(r => {
      r.categories.forEach(c => allCategories.add(c.name));
    });
    return ["all", ...Array.from(allCategories).sort()];
  }, [initialResources]);

  const filteredResources = React.useMemo(() => {
    return initialResources.filter(resource => {
      const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "all" ||
        resource.categories.some(c => c.name === selectedCategory);

      return matchesSearch && matchesCategory
    })
  }, [initialResources, searchTerm, selectedCategory]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedResources = filteredResources.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

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
            Showing {filteredResources.length} of {initialResources.length} resources
          </p>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-gray-800/80 text-gray-300 border-gray-700/50">
              {selectedCategory === "all" ? "All" : selectedCategory}
            </Badge>
            {searchTerm && (
              <Badge variant="outline" className="border-gray-700/50 text-gray-400">
                &ldquo;{searchTerm}&rdquo;
              </Badge>
            )}
          </div>
        </div>

        {/* Resource Cards Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={{
                  id: resource.id,
                  slug: resource.slug,
                  title: resource.name,
                  description: resource.shortDescription || resource.description,
                  category: resource.categories[0]?.name || "Uncategorized",
                  stars: resource.stars.toString(),
                  forks: resource.forks.toString(),
                  lastCommit: timeAgo(resource.lastCommit),
                  logo: resource.logo,
                  image: resource.image || "/api/placeholder/300/200"
                }}
              />
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