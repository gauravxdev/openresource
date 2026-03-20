"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

interface SearchFiltersProps {
  selectedCategory: string
  categories: string[]
}

export const SearchFilters = React.memo(function SearchFilters({
  selectedCategory,
  categories
}: SearchFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const initialSearch = searchParams.get("q") ?? ""
  const [searchTerm, setSearchTerm] = React.useState(initialSearch)
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Update URL when debounced search term changes
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedSearch) {
      params.set("q", debouncedSearch)
    } else {
      params.delete("q")
    }
    params.set("page", "1") // Reset to page 1 on search
    
    // Only push if the search term actually changed in the URL
    if (params.get("q") !== (searchParams.get("q") ?? "")) {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }, [debouncedSearch, pathname, router, searchParams])

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("category")
    } else {
      params.set("category", value)
    }
    params.set("page", "1") // Reset to page 1 on filter
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filter — native select to avoid Radix Select bundle weight */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="h-9 w-[180px] rounded-md border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
          aria-label="Filter by category"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? "All Categories" : category}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
})

