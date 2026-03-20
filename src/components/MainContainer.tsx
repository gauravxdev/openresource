import { ResourceCard } from "./ResourceCard"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MainPagination } from "@/components/MainPagination"
import { SearchFilters } from "./SearchFilters"
import { timeAgo } from "@/lib/utils"
import type { ResourceWithCategories } from "@/actions/resources"

import { Suspense } from "react"

interface MainContainerProps {
  initialResources: ResourceWithCategories[];
  totalCount: number;
  currentPage: number;
  categories?: string[];
  selectedCategory?: string;
  searchTerm?: string;
}

const MainContainer = ({ 
  initialResources = [], 
  totalCount = 0, 
  currentPage = 1,
  categories = ["all"],
  selectedCategory = "all",
}: MainContainerProps) => {
  const itemsPerPage = 20

  return (
    <div className="w-full bg-background min-h-screen">
      <Separator />
      {/* Main content container with same width as navbar */}
      <div className="mx-auto max-w-[1152px] px-5 pb-20 pt-8 md:px-6 md:pt-12">
        {/* Search and Filters */}
        <Suspense fallback={<div className="h-10 w-full animate-pulse bg-muted rounded-md mb-6" />}>
          <SearchFilters
            selectedCategory={selectedCategory}
            categories={Array.from(new Set(["all", ...categories]))}
          />
        </Suspense>

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
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        <MainPagination
          currentPage={currentPage}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  )
}


export default MainContainer