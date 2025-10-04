"use client"

import { Badge } from "@/components/ui/badge"
import { type SortOption } from "@/lib/android-apps-data"

interface AndroidAppResultsSummaryProps {
  filteredCount: number
  totalCount: number
  sortBy: SortOption
  searchTerm: string
}

export const AndroidAppResultsSummary = ({
  filteredCount,
  totalCount,
  sortBy,
  searchTerm
}: AndroidAppResultsSummaryProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-gray-400 text-sm">
        Showing {filteredCount} of {totalCount} apps
      </p>
      <div className="flex gap-2">
        <Badge variant="secondary" className="bg-gray-800/80 text-gray-300 border-gray-700/50">
          {sortBy === "popular" ? "Popular" : sortBy}
        </Badge>
        {searchTerm && (
          <Badge variant="outline" className="border-gray-700/50 text-gray-400">
            "{searchTerm}"
          </Badge>
        )}
      </div>
    </div>
  )
}
