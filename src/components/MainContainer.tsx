"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SearchFilters } from "./SearchFilters"
import { ResourceCard } from "./ResourceCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination-wrapper"
import { Separator } from "@/components/ui/separator"
import { timeAgo } from "@/lib/utils"
import type { ResourceWithCategories } from "@/actions/resources"

interface MainContainerProps {
  initialResources: ResourceWithCategories[];
  totalCount: number;
  currentPage: number;
}

const MainContainer = ({ initialResources = [], totalCount = 0, currentPage = 1 }: MainContainerProps) => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = React.useState("")
  const itemsPerPage = 20

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set("page", page.toString())
    router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false })
  }

  // Categories are now just for display/links, or we could fetch them too
  // For now, let's keep the basic category extraction from the current page's results
  const categories = React.useMemo(() => {
    const allCategories = new Set<string>();
    initialResources.forEach(r => {
      r.categories.forEach(c => allCategories.add(c.name));
    });
    return ["all", ...Array.from(allCategories).sort()];
  }, [initialResources]);

  return (
    <div className="w-full bg-background min-h-screen">
      <Separator />
      {/* Main content container with same width as navbar */}
      <div className="mx-auto max-w-[1152px] px-5 pb-20 pt-8 md:px-6 md:pt-12">
        {/* Search and Filters */}
        <SearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory="all" // Server-side filtering by category is handled by specific pages
          onCategoryChange={() => undefined} // Disabled for now, handled by separate pages
          categories={categories}
        />

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-400 text-sm">
            Showing resources {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
          </p>
        </div>

        {/* Resource Cards Grid */}
        {initialResources.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {initialResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={{
                  id: resource.id,
                  slug: resource.slug,
                  title: resource.name,
                  description: resource.description,
                  shortDescription: resource.shortDescription,
                  oneLiner: resource.oneLiner,
                  alternative: resource.alternative,
                  category: resource.categories[0]?.name ?? "Uncategorized",
                  stars: resource.stars.toString(),
                  forks: resource.forks.toString(),
                  lastCommit: timeAgo(resource.lastCommit),
                  logo: resource.logo,
                  image: resource.image ?? "/api/placeholder/300/200"
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
                  router.push(window.location.pathname)
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalCount > itemsPerPage && (
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