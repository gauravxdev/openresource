"use client"

import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type SortOption } from "@/lib/android-apps-data"

interface AndroidAppFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  sortBy: SortOption
  onSortChange: (value: SortOption) => void
}

export const AndroidAppFilters = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange
}: AndroidAppFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search apps..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sort Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px] pl-10">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="atoz">A to Z</SelectItem>
            <SelectItem value="ztoa">Z to A</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="downloads">Most Downloads</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
